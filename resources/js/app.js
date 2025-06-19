require('./bootstrap');

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/inertia-react';
import { InertiaProgress } from '@inertiajs/progress';
import { Provider } from 'react-redux';
import MenuItems from './States/MenuItems';
import '@/assets/css/styles.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/id';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Laravel';
const rootElement = document.getElementById("app");
const root = createRoot(rootElement);

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Jakarta");

// Define your custom Material-UI theme
const theme = createTheme({
    typography: {
        fontFamily: 'Nunito, sans-serif',
    },
    palette: {
        primary: {
            main: '#1D2939', // Custom primary color
        },
        secondary: {
            main: '#19857b', // Custom secondary color
        },
    },
});

createInertiaApp({
    title: (title) => `${title} | ${appName}`,
    resolve: (name) => require(`./Pages/${name}`),
    setup({ el, App, props }) {
        return root.render(
            <ThemeProvider theme={theme}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='id'>
                    <Provider store={MenuItems}>
                        <App {...props} />
                    </Provider>
                </LocalizationProvider>
            </ThemeProvider>
        );
    },
});

InertiaProgress.init({ color: '#4B5563' });
