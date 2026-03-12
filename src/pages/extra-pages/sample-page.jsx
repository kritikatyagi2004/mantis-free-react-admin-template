// material-ui
import { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  IconButton,
  Chip,
  Box,
  Card,
  CardContent,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Tooltip,
  useTheme,
  alpha,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress
} from '@mui/material';

// ==============================|| REPORTS PAGE ||============================== //

export default function ReportsPage() {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [agentNumber, setAgentNumber] = useState('');
  const [agentNumberInput, setAgentNumberInput] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    state: ''
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [apiCalled, setApiCalled] = useState(false);
  const [compactView, setCompactView] = useState(false);
  
  // Audio player states
  const [playerDialog, setPlayerDialog] = useState({ open: false, url: '', title: '' });

  // Set today's date as default in YYYY-MM-DD format
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFromDate(today);
    setToDate(today);
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCustomerNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCustomerNumber(value);
  };

  const handleAgentNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setAgentNumberInput(value);
  };

  // UPDATED: API call function with Agent Number as optional
  const fetchReportData = async () => {
    const currentAgentNumber = agentNumberInput || agentNumber;
    
    // Agent number is now optional - removed required check
    
    if (!fromDate || !toDate) {
      setSnackbar({
        open: true,
        message: '⚠️ Please select both From Date and To Date',
        severity: 'warning'
      });
      return;
    }

    // Ensure dates are in YYYY-MM-DD format
    const formattedFromDate = fromDate.split('T')[0];
    const formattedToDate = toDate.split('T')[0];

    setLoading(true);
    setAgentNumber(currentAgentNumber);
    
    setSnackbar({
      open: true,
      message: currentAgentNumber 
        ? `🔄 Fetching report data for Agent: ${currentAgentNumber}...`
        : '🔄 Fetching all report data...',
      severity: 'info'
    });

    try {
      // FIXED: Proper URL without any spaces or line breaks
      const baseUrl = 'https://voice.vocalbox.in/api/Master/GetClickToCallDetails';
      
      // Build URL with optional parameters
      let url = `${baseUrl}?FromDate=${formattedFromDate}&ToDate=${formattedToDate}`;
      
      // Add AgentNumber only if provided
      if (currentAgentNumber) {
        url += `&AgentNumber=${currentAgentNumber}`;
      }
      
      console.log('Calling API:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': '*/*'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('API Response:', responseData);
      
      // Check if response is an array
      if (!Array.isArray(responseData)) {
        setData([]);
        setSnackbar({
          open: true,
          message: '⚠️ Invalid data format received from server',
          severity: 'warning'
        });
        setApiCalled(true);
        setLoading(false);
        return;
      }

      if (responseData.length === 0) {
        setData([]);
        setSnackbar({
          open: true,
          message: currentAgentNumber 
            ? `ℹ️ No records found for Agent: ${currentAgentNumber}`
            : 'ℹ️ No records found for selected date range',
          severity: 'info'
        });
        setApiCalled(true);
        setLoading(false);
        return;
      }
      
      // Transform the data to match your table structure
      const transformedData = responseData.map((item, index) => {
        // Handle CallDuration - check both fields
        let callDuration = 0;
        if (item.CallDuration) {
          callDuration = parseInt(item.CallDuration) || 0;
        } else if (item.CallDuration1) {
          callDuration = parseInt(item.CallDuration1) || 0;
        }

        // Handle IVR Duration
        let ivrDuration = 0;
        if (item.IvrDuration) {
          ivrDuration = parseInt(item.IvrDuration) || 0;
        }

        // Format date - ensure YYYY-MM-DD
        let formattedDate = 'N/A';
        if (item.Date) {
          try {
            if (typeof item.Date === 'string') {
              formattedDate = item.Date.split('T')[0];
            } else {
              formattedDate = new Date(item.Date).toISOString().split('T')[0];
            }
          } catch (e) {
            formattedDate = String(item.Date);
          }
        }

        // Format time - extract HH:MM:SS
        let formattedTime = 'N/A';
        if (item.Time) {
          formattedTime = item.Time.substring(0, 8);
        }

        // Determine call status - FIXED: Better status detection
        let callStatus = item.CallStatus || 'NO ANSWER';
        if (!item.CallStatus && (item.CallDuration || item.CallDuration1)) {
          callStatus = 'ANSWER';
        }

        // Determine if recording exists - FIXED: Check for valid recording URL
        const hasRecording = item.RecordingURL && 
                            item.RecordingURL !== null && 
                            item.RecordingURL.trim() !== '' &&
                            !item.RecordingURL.toLowerCase().includes('null');

        // Get recording format
        let recordingFormat = null;
        if (hasRecording) {
          const urlParts = item.RecordingURL.split('.');
          recordingFormat = urlParts[urlParts.length - 1].toUpperCase();
        }

        return {
          id: item.Id || index + 1,
          srNo: index + 1,
          agentNumber: item.AgentNumber || 'N/A',
          customerNumber: item.CallerNumber || 'N/A',
          callDate: formattedDate,
          callTime: formattedTime,
          callDuration: isNaN(callDuration) ? 0 : callDuration,
          ivrDuration: isNaN(ivrDuration) ? 0 : ivrDuration,
          callStatus: callStatus,
          state: item.State || 'Unknown',
          recordingUrl: hasRecording ? item.RecordingURL : null,
          hasRecording: hasRecording,
          recordingFormat: recordingFormat
        };
      });

      console.log('Transformed Data:', transformedData);
      setData(transformedData);
      setApiCalled(true);
      setPage(0);
      
      setSnackbar({
        open: true,
        message: currentAgentNumber
          ? `✅ Loaded ${transformedData.length} records for Agent: ${currentAgentNumber}`
          : `✅ Loaded ${transformedData.length} records for date range`,
        severity: 'success'
      });

    } catch (error) {
      console.error('API Error:', error);
      
      let errorMessage = 'Failed to fetch data from API';
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check if the server is running and CORS is enabled';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      setSnackbar({
        open: true,
        message: `❌ ${errorMessage}`,
        severity: 'error'
      });
      
      setData([]);
      setApiCalled(true);
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Test API function with optional agent number
  const testApiConnection = async () => {
    const currentAgentNumber = agentNumberInput || agentNumber;
    
    if (!fromDate || !toDate) {
      setSnackbar({
        open: true,
        message: '⚠️ Please select both From Date and To Date first',
        severity: 'warning'
      });
      return;
    }

    const formattedFromDate = fromDate.split('T')[0];
    const formattedToDate = toDate.split('T')[0];

    try {
      let testUrl = `https://voice.vocalbox.in/api/Master/GetClickToCallDetails?FromDate=${formattedFromDate}&ToDate=${formattedToDate}`;
      
      if (currentAgentNumber) {
        testUrl += `&AgentNumber=${currentAgentNumber}`;
      }
      
      console.log('Testing API:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'accept': '*/*'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Test successful, received:', data);
        setSnackbar({
          open: true,
          message: `✅ API Connection successful! Found ${data.length} records`,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: `❌ API Error: ${response.status}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Test failed:', error);
      setSnackbar({
        open: true,
        message: `❌ Connection failed: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleSearch = () => {
    if (!apiCalled) {
      setSnackbar({
        open: true,
        message: '⚠️ Please fetch data first',
        severity: 'warning'
      });
      return;
    }
    setPage(0);
  };

  const handleDownload = () => {
    if (!apiCalled || filteredData.length === 0) {
      setSnackbar({
        open: true,
        message: '⚠️ No data to download',
        severity: 'warning'
      });
      return;
    }

    setSnackbar({
      open: true,
      message: '📥 Preparing download...',
      severity: 'info'
    });

    const headers = ['SR No', 'Agent Number', 'Caller Number', 'Date', 'Time', 'Call Duration (sec)', 'IVR Duration (sec)', 'Status', 'State', 'Recording', 'Recording URL'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => 
        [
          row.srNo,
          row.agentNumber,
          row.customerNumber,
          row.callDate,
          row.callTime,
          row.callDuration,
          row.ivrDuration,
          row.callStatus,
          row.state,
          row.hasRecording ? 'Yes' : 'No',
          row.recordingUrl || 'N/A'
        ].map(field => `"${field}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call-report-${fromDate}-to-${toDate}${agentNumber ? `-agent-${agentNumber}` : ''}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setSnackbar({
      open: true,
      message: '✅ Report downloaded successfully!',
      severity: 'success'
    });
  };

  const handleRefresh = () => {
    if (fromDate && toDate) {
      fetchReportData();
    } else {
      setSnackbar({
        open: true,
        message: '⚠️ Please select dates first',
        severity: 'warning'
      });
    }
  };

  const handleResetFilters = () => {
    setCustomerNumber('');
    setSearchTerm('');
    setFilters({ status: '', state: '' });
    setPage(0);
    setSnackbar({
      open: true,
      message: '🔄 Filters reset',
      severity: 'info'
    });
  };

  const handleResetAll = () => {
    setAgentNumberInput('');
    setAgentNumber('');
    setCustomerNumber('');
    setSearchTerm('');
    const today = new Date().toISOString().split('T')[0];
    setFromDate(today);
    setToDate(today);
    setFilters({ status: '', state: '' });
    setData([]);
    setApiCalled(false);
    setPage(0);
    setSnackbar({
      open: true,
      message: '🔄 All fields reset',
      severity: 'info'
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    switch(status.toUpperCase()) {
      case 'ANSWER': return 'success';
      case 'ANSWERED': return 'success';
      case 'NO ANSWER': return 'error';
      case 'BUSY': return 'warning';
      case 'FAILED': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return '📞';
    switch(status.toUpperCase()) {
      case 'ANSWER': return '✅';
      case 'ANSWERED': return '✅';
      case 'NO ANSWER': return '❌';
      case 'BUSY': return '⏰';
      case 'FAILED': return '❌';
      default: return '📞';
    }
  };

  const handlePlayRecording = (row) => {
    if (row.recordingUrl) {
      setPlayerDialog({
        open: true,
        url: row.recordingUrl,
        title: `Recording: ${row.customerNumber} - ${row.callDate} ${row.callTime}`
      });
    } else {
      setSnackbar({
        open: true,
        message: '⚠️ No recording available for this call',
        severity: 'warning'
      });
    }
  };

  const handleDownloadRecording = (url, fileName) => {
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'recording';
      a.target = '_blank';
      a.click();
    }
  };

  const handleClosePlayer = () => {
    setPlayerDialog({ open: false, url: '', title: '' });
  };

  // Filter data
  const filteredData = data.filter(item => {
    const matchesCustomer = !customerNumber || 
      (item.customerNumber && item.customerNumber.includes(customerNumber));
    const matchesSearch = !searchTerm || 
      (item.agentNumber && item.agentNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.customerNumber && item.customerNumber.includes(searchTerm)) ||
      (item.state && item.state.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !filters.status || 
      (item.callStatus && item.callStatus === filters.status);
    const matchesState = !filters.state || 
      (item.state && item.state === filters.state);
    
    return matchesCustomer && matchesSearch && matchesStatus && matchesState;
  });

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const uniqueStates = [...new Set(data.map(item => item.state).filter(Boolean))];
  const uniqueStatuses = [...new Set(data.map(item => item.callStatus).filter(Boolean))];

  return (
    <Box sx={{ p: 2, minHeight: '100vh', background: theme.palette.background.default }}>
      
      {/* Header */}
      <Paper
        elevation={12}
        sx={{
          p: 2,
          mb: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
          borderRadius: 2
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Click to Call Reports
            </Typography>
            {agentNumber && (
              <Typography variant="subtitle2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Filtering by Agent: {agentNumber}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Tooltip title="Toggle Compact View">
              <IconButton 
                onClick={() => setCompactView(!compactView)}
                sx={{ color: 'white', bgcolor: alpha('#fff', 0.1) }}
              >
                <Box component="span" sx={{ fontSize: '1.2rem' }}>
                  {compactView ? '🔲' : '🔳'}
                </Box>
              </IconButton>
            </Tooltip>
            <Tooltip title="Test API Connection">
              <IconButton 
                onClick={testApiConnection}
                sx={{ color: 'white', bgcolor: alpha('#fff', 0.1) }}
              >
                <Box component="span" sx={{ fontSize: '1.2rem' }}>
                  🔌
                </Box>
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* Filter Section */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Card elevation={8} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box component="span" sx={{ fontSize: '1.2rem' }}>🔍</Box>
                  Search & Filters
                </Typography>
              </Stack>

              <Grid container spacing={1.5}>
                {/* Date Range - Required */}
                <Grid item xs={6} sm={3} md={2}>
                  <TextField
                    fullWidth
                    label="From Date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    required
                  />
                </Grid>

                <Grid item xs={6} sm={3} md={2}>
                  <TextField
                    fullWidth
                    label="To Date"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    required
                  />
                </Grid>

                {/* Agent Number Input - Optional now */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Agent Number (Optional)"
                    value={agentNumberInput}
                    onChange={handleAgentNumberChange}
                    placeholder="Enter Agent Number to filter"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box component="span" sx={{ fontSize: '1rem' }}>👤</Box>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                {/* Customer Number */}
                <Grid item xs={6} sm={3} md={2}>
                  <TextField
                    fullWidth
                    label="Customer No"
                    value={customerNumber}
                    onChange={handleCustomerNumberChange}
                    placeholder="Search by number"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box component="span" sx={{ fontSize: '1rem' }}>📞</Box>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                {/* Buttons */}
                <Grid item xs={12} sm={12} md={12}>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<Box component="span" sx={{ fontSize: '1rem' }}>🔍</Box>}
                      onClick={fetchReportData}
                      disabled={loading}
                    >
                      {loading ? 'Searching...' : 'Search'}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      startIcon={<Box component="span" sx={{ fontSize: '1rem' }}>🔄</Box>}
                      onClick={handleRefresh}
                      disabled={loading}
                    >
                      Refresh
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Box component="span" sx={{ fontSize: '1rem' }}>📊</Box>}
                      onClick={handleDownload}
                      disabled={!apiCalled || filteredData.length === 0}
                    >
                      Download
                    </Button>
                    
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<Box component="span" sx={{ fontSize: '1rem' }}>🗑️</Box>}
                      onClick={handleResetAll}
                    >
                      Reset All
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics */}
        {apiCalled && data.length > 0 && (
          <Grid item xs={12}>
            <Grid container spacing={1}>
              {[
                { icon: '📞', label: 'Total Calls', value: filteredData.length, color: '#2196f3' },
                { icon: '✅', label: 'Answered', value: filteredData.filter(d => d.callStatus === 'ANSWER').length, color: '#4caf50' },
                { icon: '❌', label: 'No Answer', value: filteredData.filter(d => d.callStatus === 'NO ANSWER' || !d.callStatus).length, color: '#f44336' },
                { icon: '⏱️', label: 'Avg Duration', value: filteredData.length ? formatDuration(Math.round(filteredData.reduce((acc, d) => acc + (d.callDuration || 0), 0) / filteredData.length)) : '0:00', color: '#ff9800' },
                { icon: '🎙️', label: 'Recordings', value: filteredData.filter(d => d.hasRecording).length, color: '#9c27b0' },
                { icon: '📍', label: 'States', value: uniqueStates.length, color: '#ffc107' }
              ].map((stat, index) => (
                <Grid item xs={4} sm={4} md={2} key={index}>
                  <Paper
                    elevation={4}
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(stat.color, 0.1)} 100%)`,
                      border: `1px solid ${alpha(stat.color, 0.2)}`
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ 
                        p: 1, 
                        borderRadius: 2, 
                        bgcolor: alpha(stat.color, 0.1),
                        color: stat.color,
                        fontSize: '1.2rem'
                      }}>
                        {stat.icon}
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">{stat.label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{stat.value}</Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
      </Grid>

      {/* Loading Indicator */}
      {loading && (
        <LinearProgress sx={{ mb: 1 }} />
      )}

      {/* Data Table */}
      <Paper elevation={8} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
          <Table stickyHeader size={compactView ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                {compactView ? (
                  ['#', 'Agent', 'Caller', 'Date', 'Time', 'Dur', 'Status', 'State', 'Recording'].map((header, index) => (
                    <TableCell key={index} sx={{ bgcolor: theme.palette.primary.main, color: 'white', py: 1, fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {header}
                    </TableCell>
                  ))
                ) : (
                  ['SR No', 'Agent Number', 'Caller Number', 'Date', 'Time', 'Duration', 'IVR', 'Status', 'State', 'Recording'].map((header, index) => (
                    <TableCell key={index} sx={{ bgcolor: theme.palette.primary.main, color: 'white', py: 1.5, fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {header}
                    </TableCell>
                  ))
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {!apiCalled ? (
                <TableRow>
                  <TableCell colSpan={compactView ? 9 : 10} sx={{ py: 4, textAlign: 'center' }}>
                    <Stack alignItems="center" spacing={1}>
                      <Box sx={{ fontSize: '2rem' }}>📊</Box>
                      <Typography color="textSecondary">
                        Click "Search" to load reports
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : loading ? (
                <TableRow>
                  <TableCell colSpan={compactView ? 9 : 10} sx={{ py: 4, textAlign: 'center' }}>
                    <Stack alignItems="center" spacing={1}>
                      <Box sx={{ fontSize: '2rem', animation: 'spin 2s linear infinite' }}>🔄</Box>
                      <Typography>Loading data{agentNumber ? ` for Agent: ${agentNumber}` : '...'}</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={compactView ? 9 : 10} sx={{ py: 4, textAlign: 'center' }}>
                    <Stack alignItems="center" spacing={1}>
                      <Box sx={{ fontSize: '2rem' }}>🔍</Box>
                      <Typography>
                        No records found{agentNumber ? ` for Agent: ${agentNumber}` : ''}
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row) => (
                  <TableRow 
                    key={row.id} 
                    hover 
                    sx={{ 
                      '&:hover': { bgcolor: alpha(theme.palette.primary.light, 0.05) }
                    }}
                  >
                    {compactView ? (
                      // Compact View
                      <>
                        <TableCell>{row.srNo}</TableCell>
                        <TableCell>
                          <Tooltip title={row.agentNumber}>
                            <Typography variant="caption" noWrap sx={{ maxWidth: 60, display: 'block' }}>
                              {row.agentNumber.slice(-4)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={row.customerNumber}>
                            <Typography variant="caption" noWrap sx={{ maxWidth: 80, display: 'block' }}>
                              {row.customerNumber.slice(-8)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {row.callDate.slice(5)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {row.callTime.slice(0,5)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {formatDuration(row.callDuration)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={row.callStatus || 'NO ANSWER'}>
                            <Box component="span" sx={{ fontSize: '1rem' }}>
                              {getStatusIcon(row.callStatus)}
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={row.state}>
                            <Typography variant="caption" noWrap sx={{ maxWidth: 50, display: 'block' }}>
                              {row.state}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {row.hasRecording ? (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Tooltip title="Play Recording">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handlePlayRecording(row)}
                                  sx={{ 
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                                  }}
                                >
                                  <Box component="span" sx={{ fontSize: '1rem' }}>▶️</Box>
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Download Recording">
                                <IconButton 
                                  size="small"
                                  onClick={() => handleDownloadRecording(row.recordingUrl, `recording_${row.customerNumber}_${row.callDate}.${row.recordingFormat?.toLowerCase() || 'mp3'}`)}
                                  sx={{ 
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) }
                                  }}
                                >
                                  <Box component="span" sx={{ fontSize: '1rem' }}>⬇️</Box>
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          ) : (
                            <Chip
                              label="No Recording"
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.6rem', opacity: 0.6 }}
                            />
                          )}
                        </TableCell>
                      </>
                    ) : (
                      // Full View
                      <>
                        <TableCell>{row.srNo}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {row.agentNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {row.customerNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {row.callDate}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {row.callTime}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={formatDuration(row.callDuration)} 
                            size="small" 
                            sx={{ borderRadius: 1, height: 22 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {row.ivrDuration > 0 ? formatDuration(row.ivrDuration) : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<Box component="span" sx={{ fontSize: '0.8rem' }}>{getStatusIcon(row.callStatus)}</Box>}
                            label={row.callStatus || 'NO ANSWER'}
                            color={getStatusColor(row.callStatus)}
                            size="small"
                            sx={{ borderRadius: 1, height: 22 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={row.state} 
                            variant="outlined" 
                            size="small" 
                            sx={{ borderRadius: 1, height: 22 }} 
                          />
                        </TableCell>
                        <TableCell>
                          {row.hasRecording ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={<Box component="span" sx={{ fontSize: '1rem' }}>▶️</Box>}
                                onClick={() => handlePlayRecording(row)}
                                sx={{ 
                                  height: 30,
                                  textTransform: 'none',
                                  fontSize: '0.75rem'
                                }}
                              >
                                Play
                              </Button>
                              <Tooltip title="Download Recording">
                                <IconButton 
                                  size="small"
                                  onClick={() => handleDownloadRecording(row.recordingUrl, `recording_${row.customerNumber}_${row.callDate}.${row.recordingFormat?.toLowerCase() || 'mp3'}`)}
                                  sx={{ 
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) }
                                  }}
                                >
                                  <Box component="span" sx={{ fontSize: '1rem' }}>⬇️</Box>
                                </IconButton>
                              </Tooltip>
                              {row.recordingFormat && (
                                <Chip
                                  label={row.recordingFormat}
                                  size="small"
                                  color="info"
                                  variant="outlined"
                                  sx={{ height: 24 }}
                                />
                              )}
                            </Stack>
                          ) : (
                            <Chip
                              label="No Recording"
                              size="small"
                              variant="outlined"
                              sx={{ borderRadius: 1, height: 22, opacity: 0.6 }}
                            />
                          )}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {apiCalled && filteredData.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Paper>

      {/* Summary */}
      {apiCalled && filteredData.length > 0 && (
        <Paper elevation={4} sx={{ mt: 1, p: 1, borderRadius: 2 }}>
          <Grid container alignItems="center">
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">
                Showing {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredData.length)} of {filteredData.length}{agentNumber ? ` for Agent: ${agentNumber}` : ''}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Chip size="small" label={`✅ Answered: ${filteredData.filter(d => d.callStatus === 'ANSWER').length}`} sx={{ height: 20 }} />
                <Chip size="small" label={`🎤 Recordings: ${filteredData.filter(d => d.hasRecording).length}`} sx={{ height: 20 }} />
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Audio Player Dialog */}
      <Dialog 
        open={playerDialog.open} 
        onClose={handleClosePlayer}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" noWrap sx={{ maxWidth: '80%' }}>
            {playerDialog.title}
          </Typography>
          <IconButton onClick={handleClosePlayer} size="small">
            <Box component="span" sx={{ fontSize: '1.2rem' }}>❌</Box>
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {playerDialog.url && (
            <Box sx={{ mt: 2 }}>
              <audio 
                controls 
                style={{ width: '100%' }}
                src={playerDialog.url}
                controlsList="nodownload"
              >
                Your browser does not support the audio element.
              </audio>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="textSecondary">
                  Click play button to listen to recording
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Box component="span" sx={{ fontSize: '1rem' }}>⬇️</Box>}
                  onClick={() => handleDownloadRecording(playerDialog.url, 'recording.mp3')}
                >
                  Download
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ py: 0, px: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Global Styles */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
}