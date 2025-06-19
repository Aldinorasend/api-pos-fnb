import React from 'react'
import { Box, Typography } from '@mui/material'
import useCurrencyRupiah from '@/hooks/useCurrencyRupiah'

const BillsTotalPrice = ({ totalPrice }) => {

  return (
    <Box 
      sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        padding: "0 10px", 
        marginBottom: "10px",
      }}
    >
      <Typography color={'primary'} sx={{ fontSize: "25px", fontWeight: "bold", margin:0 }}>Total</Typography>
      <Typography color={'primary'} sx={{ fontSize: "25px", fontWeight: "bold", margin:0 }}>{useCurrencyRupiah(totalPrice)}</Typography>
    </Box>
  )
}

export default BillsTotalPrice