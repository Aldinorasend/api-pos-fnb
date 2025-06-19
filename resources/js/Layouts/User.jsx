import React, { useState } from 'react';
import {
  CssBaseline,
  Box,
  Toolbar,
  Typography,
  Divider,
  IconButton,
  Container,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
} from '@mui/material';
import { Head, Link as LinkInertia, usePage } from '@inertiajs/inertia-react';
import {
  BorderColor as BorderColorIcon,
  MenuBook as MenuBookIcon,
  Logout as LogoutIcon,
  History as HistoryIcon,
  Category as CategoryIcon,
  Payment as PaymentIcon,
  PeopleAlt,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Discount as DiscountIcon,
  Storefront as StorefrontIcon,
  DashboardCustomize as DashboardCustomizeIcon,
  Percent as PercentIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';

import DrawerLeftSide from '@/Components/User/DrawerLeftSide';
import DrawerRightSide from '@/Components/User/DrawerRightSide';


/**
 * 
 * @param {any} props 
 * @returns {React.JSX.Element}
 */
function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://lakeside.matradipti.org/">
        LAKESIDE
      </Link>{' '}
      {new Date().getFullYear()}
      {'. '}
      Made With Luv❤️
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.
// const defaultTheme = createTheme();


/**
 * 
 * @param {{any, String, boolean, string, string, string, string}} param0 
 * @returns {React.JSX.Element}
 */

export default function User({ children, title, leftDrawer, api, token, userType, printer_api, outlet }) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const { translations } = usePage().props;

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const menuAdmin = [
    // all users
    { text: translations.create_order, icon: <BorderColorIcon />, href: '/' },
    { text: translations.order_history , icon: <HistoryIcon />, href: '/order', divider: true },
    { text: translations.product, icon: <MenuBookIcon />, href: '/product' },
    // admin and manager
    ...(userType === 1 || userType === 2 ? [
      { text: translations.category, icon: <CategoryIcon />, href: '/category' },
      { text: translations.modifier, icon: <DashboardCustomizeIcon />, href: '/modifier', divider: true },
    ] : []),
    // just admin
    ...(userType === 1 ? [
      { text: translations.statistics, icon: <BarChartIcon />, href: '/statistics' },
      { text: translations.payment, icon: <PaymentIcon />, href: '/payment' },
      { text: translations.discount, icon: <PercentIcon />, href: '/discount' },
      { text: translations.referral_code, icon: <DiscountIcon />, href: '/referralcode' },
      { text: translations.outlet, icon: <StorefrontIcon />, href: '/outlet' },
    ] : []),
    ...(userType === 1 || userType === 2 ? [
      { text: translations.user, icon: <PeopleAlt />, href: '/manageuser' },
    ] : []),
    { text: translations.logout, icon: <LogoutIcon />, href: '/logout', method: 'post' },
  ];
  
  return (
    <>
      <Head title={title}/>

      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <DrawerLeftSide variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              { open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Toolbar>
          <Divider />
          <List>
            {menuAdmin.map((item, index) => {
              const isActive = window.location.pathname === item.href || 
              (item.href !== '/' && window.location.pathname.startsWith(item.href));

              return (
                <React.Fragment key={index}>
                  <ListItem disablePadding sx={{ display: 'block' }}>
                    <Tooltip title={item.text} placement="right">
                      <LinkInertia 
                        as="a" 
                        href={item.href} 
                        style={{
                          textDecoration: 'none',
                          color: isActive ? theme.palette.primary.main : theme.palette.primary.main, // Highlight active item
                          fontWeight: isActive ? 'bold' : 'normal',
                        }} 
                        {...(item.method && { method: item.method })} 
                      >
                        <ListItemButton
                          sx={{
                            minHeight: 48,
                            justifyContent: open ? 'initial' : 'center',
                            px: 2.5,
                            backgroundColor: isActive ? theme.palette.primary.main : 'inherit', // Optional background for active item
                            '&:hover': isActive && {
                              backgroundColor: theme.palette.primary.main,
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              mr: open ? 3 : 'auto',
                              justifyContent: 'center',
                              color: isActive ? 'white' : 'inherit', // Icon color for active item
                            }}
                          >
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={item.text} 
                            sx={{ 
                              opacity: open ? 1 : 0, 
                              color: isActive ? 'white' : 'inherit', // Text color for active item
                            }} 
                          />
                        </ListItemButton>
                      </LinkInertia>
                    </Tooltip>
                  </ListItem>
                  {item.divider && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        </DrawerLeftSide>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Container maxWidth="xl" sx={{ mt: 4, mb: 4, ml: 4, mr: 4 }}>
            <Typography color={'primary'} fontWeight={'700'} sx={{ fontSize:'38px',  marginBottom: '15px' }}>{title}</Typography>
            <Box sx={{ width: '100%', typography: 'body1' }}>
              {children}
            </Box>
            <Copyright sx={{ pt: 4, fontSize: 15, fontWeight: 700 }} />
          </Container>
        </Box>
        {
          leftDrawer && <DrawerRightSide api={api} token={token} printer_api={printer_api} outlet={outlet || {}} />
        }
      </Box>
    </>
  );
}
