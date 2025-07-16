import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Button, Drawer, List, ListItemIcon, ListItemText, Box, useTheme, useMediaQuery, ListItemButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import StoreIcon from '@mui/icons-material/Store';
import GroupIcon from '@mui/icons-material/Group';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Sales', icon: <ReceiptIcon />, path: '/admin/sales' },
    { text: 'Products', icon: <StoreIcon />, path: '/admin/products' },
    { text: 'Users', icon: <GroupIcon />, path: '/admin/users' },
    { text: 'Expenses', icon: <MoneyOffIcon />, path: '/admin/expenses' },
    { text: 'Logout', icon: <LogoutIcon />, path: '/logout' },
];

const AdminNavbar = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleNav = (path) => {
        navigate(path);
        setDrawerOpen(false);
    };

    return (
        <AppBar position="fixed" sx={{ bgcolor: '#ff8800', zIndex: (theme) => theme.zIndex.drawer + 1, height: { xs: 56, md: 64 } }} elevation={2}>
            <Toolbar>
                {isMobile && (
                    <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
                        <MenuIcon />
                    </IconButton>
                )}
                <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
                    Shree Ram Rajasthan Kulfi House
                </Typography>
                {!isMobile && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {navItems.map((item) => (
                            <Button
                                key={item.text}
                                startIcon={item.icon}
                                onClick={() => handleNav(item.path)}
                                sx={{
                                    color: location.pathname === item.path ? '#fff' : '#fff',
                                    bgcolor: location.pathname === item.path ? '#ff8800cc' : 'transparent',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    px: 2,
                                    '&:hover': { bgcolor: '#ff8800bb' },
                                }}
                            >
                                {item.text}
                            </Button>
                        ))}
                    </Box>
                )}
            </Toolbar>
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    [`& .MuiDrawer-paper`]: {
                        width: 220,
                        boxSizing: 'border-box',
                        bgcolor: '#fff',
                        borderRight: '2px solid #ff880022',
                    },
                }}
            >
                <Box sx={{ width: 220 }} role="presentation">
                    <List>
                        {navItems.map((item) => (
                            <ListItemButton
                                key={item.text}
                                selected={location.pathname === item.path}
                                onClick={() => handleNav(item.path)}
                                sx={{ my: 0.5, bgcolor: location.pathname === item.path ? '#ff880022' : 'transparent' }}
                            >
                                <ListItemIcon sx={{ color: '#ff8800' }}>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 600 }} />
                            </ListItemButton>
                        ))}
                    </List>
                </Box>
            </Drawer>
        </AppBar>
    );
};

export default AdminNavbar; 