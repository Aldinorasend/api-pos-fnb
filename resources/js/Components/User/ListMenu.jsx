import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { initializeData, selectMenu } from '@/States/MenuItems'
import { Box, Grid, Stack, Typography } from '@mui/material'
import useCurrencyRupiah from '@/hooks/useCurrencyRupiah'
import CustomizeMenu from './CustomizeMenu';

const calculateSingleMenuPrice = (item) => {
    const flatModifiers = item.modifiers.flatMap(v => v.modifier_options)
    const variantCost = item.variants.reduce((t,v) => t+(v.id == item.selectedVariant && v.price), 0);
    const modifierCost = flatModifiers.reduce((t,v) => t+(item.selectedModifiers.includes(v.id) && v.price), 0);
    return (variantCost + modifierCost);
}

const ListMenuItem = ({menuItem}) => {
    const [modalOpen, setModalOpen] = React.useState(false);
    const flatModifiers = React.useMemo(() => menuItem.modifiers.flatMap(v => v.modifier_options), [menuItem])
    const menuVariant = React.useMemo(
        () => {
            const filtered = menuItem.variants.filter(v => v.id == menuItem.selectedVariant)[0];
            return filtered && (filtered.name != "default" || menuItem.variants.length != 1) ? filtered.name : "";
        }, [menuItem]
    );
    const menuModifiers = React.useMemo(
        () => {
            const filtered = flatModifiers.filter(v => menuItem.selectedModifiers.includes(v.id));
            return filtered.map(v => v.name)
        }, [menuItem]
    )
    return (
        <Grid sx={{cursor: "pointer", border: '1px solid #ccc', borderRadius: '4px', backgroundColor:'#f7f7f7'}} item xs={12}>
            <Grid container spacing={2} onClick={()=>setModalOpen(true)} 
                sx={{ 
                    "& .MuiGrid-item": { 
                        padding: 0, 
                    },
                    padding: '10px',
                }}
            >
                <Grid item xs={5}>
                    {menuItem.name} {menuVariant ? `- ${menuVariant}` : ""}
                    <Stack>
                        {menuModifiers.map((v, i) => (
                            <Typography key={i} variant='caption'>{v}</Typography>
                        ))}
                        {menuItem.notes && menuItem.notes != "" && <Typography variant='caption'>{`"${menuItem.notes}"`}</Typography>}
                    </Stack>
                </Grid>
                <Grid item xs={2}>
                    {menuItem.count}x
                </Grid>
                <Grid item xs={5} textAlign={'right'}>
                    <Typography sx={{ fontWeight: "bold" }}>
                        {useCurrencyRupiah(calculateSingleMenuPrice(menuItem))}
                    </Typography>
                </Grid>
            </Grid>
            <CustomizeMenu open={modalOpen} onClose={()=>setModalOpen(false)} item={menuItem}/>
        </Grid>
    )
}

const ListMenu = () => {
    const [price, setPrice] = React.useState(0)
    const menu = useSelector(selectMenu)

    return (
        <Box sx={{ flexGrow: 1, padding: "0px 10px", fontWeight: 700, overflowY: 'auto', minHeight:'45vh', maxHeight: '45vh', scrollbarWidth:'none' }}>
            {
            (!menu || menu.length === 0) ? (
                <Typography sx={{ textAlign: 'center', fontSize: '16px', color: 'gray' }}>
                    No items have been added.
                </Typography>
            ) : (
                <Grid container spacing={2} sx={{ margin: 0, width: '100%', gap: 1 }}>
                    {
                        JSON.parse(JSON.stringify(menu)).map((menuItem, index) => (
                            <ListMenuItem key={index} menuItem={menuItem} />
                        ))
                    }
                </Grid>
            )
        }
        </Box>
    )
}

export default ListMenu