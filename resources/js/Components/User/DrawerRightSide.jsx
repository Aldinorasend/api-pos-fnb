import React from 'react'
import BillsItem from './BillsItem'
import { Drawer } from '@mui/material'

const DrawerRightSide = ({api, printer_api, outlet}) => {
    return (
        <Drawer anchor='right' open={true} variant='persistent' elevation={0.0} PaperProps={{
            sx: {
                backgroundColor: "transparent",
                borderLeft: "0",
                overflowX: "hidden",
            }
        }}>
            <BillsItem api={api} printer_api={printer_api} outlet={outlet} />
        </Drawer>
    )
}

export default DrawerRightSide