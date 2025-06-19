import useCurrencyRupiah from "@/hooks/useCurrencyRupiah";
import { Box, Grid, Modal, Typography, ButtonBase, Stack, Container, ButtonGroup, Button, TextField, colors, useTheme } from "@mui/material"
import { useDispatch } from "react-redux";
import { deleteData, insertData, updateData } from "@/States/MenuItems";
import { useEffect, useState, useMemo } from "react";

const StylizedButton =  ({onClick, filled, variant="large", children}) => {
    const theme = useTheme();

    return (
        <ButtonBase onClick={onClick} sx={
            { 
                width: "100%", 
                px: 1, 
                py: {large: 2, small: 1}[variant],
                backgroundColor: filled ? theme.palette.primary.main : 'white', 
                border: 2, 
                borderColor: filled ? theme.palette.primary.main : 'black',  
                borderRadius: "8px", 
                boxShadow: 2
            }
        }>
            <Typography sx={{m: 0, fontWeight: "bold", color: filled ? 'white' : 'black' }} paragraph>{children}</Typography>
        </ButtonBase>
    )
}

const CustomizeMenu = ({ open, onClose, item }) => {
    const dispatch = useDispatch();
    const [menuCount, setMenuCount] = useState(1);
    const [menuNote, setMenuNote] = useState("");
    const [selectedVariant, setSelectedVariant] = useState(0);
    const [selectedModifiers, setSelectedModifiers] = useState([]);
    const flatModifiers = useMemo(() => item.modifiers.flatMap(v => v.modifier_options), [item]);
    const [modifierErrors, setModifierErrors] = useState([]);


    const [createNew, setCreateNew] = useState(true);
    const variantCost = item.variants.reduce((t,v) => t+(v.id == selectedVariant && v.price), 0);
    const modifierCost = flatModifiers.reduce((t,v) => t+(selectedModifiers.includes(v.id) && v.price), 0);
    const singleCost = (variantCost + modifierCost);

    if (!menuCount || menuCount < 1) {
        setMenuCount(1)
    }

    const handleCancel = () => {
        onClose();
    }

    const validate = () => {
        const requiredModifiers = item.modifiers.filter(v => v.is_required);
        const errors = requiredModifiers.filter(v => {
            return v.modifier_options.reduce((res, opt) => res && !selectedModifiers.includes(opt.id), true)
        }
            
        ).map(v => v.id);
        setModifierErrors(errors);
        if (errors.length > 0) return false;
        return true;
    }

    const handleSave = () => {
        if (!validate()) return;
        let data = {
            ...item,
            selectedVariant,
            selectedModifiers,
            notes: menuNote,
            count: menuCount
        }
        if (createNew) {
            dispatch(insertData(data));
        } else {
            dispatch(updateData(data));
        }
        onClose();
    }

    const loadMenu = () => {
        const itemCopy = JSON.parse(JSON.stringify(item));
        if ("itemId" in item) {
            setSelectedModifiers(itemCopy.selectedModifiers);
            setSelectedVariant(itemCopy.selectedVariant);
            setMenuNote(itemCopy.notes);
            setMenuCount(itemCopy.count);
            setCreateNew(false);
        } else {
            setSelectedModifiers([]);
            setSelectedVariant(itemCopy.variants[0].id);
            setMenuNote("");
            setMenuCount(1);
            setCreateNew(true);
        }
    }

    const handleVariantChange = (id) => {
        setSelectedVariant(id);
    }

    const handleModifierChange = (id) => {
        if (selectedModifiers.includes(id)) {
            setSelectedModifiers(selectedModifiers.filter((v) => v != id))
        } else {
            setSelectedModifiers([...selectedModifiers, id])
        }
    }

    const incrementMenuCount = () => {
        setMenuCount(prevCount => prevCount + 1);
    }

    const decrementMenuCount = () => {
        if (menuCount > 1) {
            setMenuCount(prevCount => prevCount - 1);
        }
    }

    const handleRemove = () => {
        dispatch(deleteData(item.itemId));
        onClose();
    }

    useEffect(()=>{
        loadMenu();
        setModifierErrors([]);
    }, [item, open])

    return (
        <Modal open={open} onClose={handleCancel}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    borderRadius: "16px",
                    bgcolor: "white",
                    minWidth: "500px",
                    width: "50%"
                }}
            >
                <Box sx={{ borderBottom: 1, borderColor: "grey.500", p: 3 }}>
                    <Grid container alignItems="center" spacing={1}>
                        <Grid item xs={2}>
                            <StylizedButton onClick={handleCancel} filled={false} variant="small">CANCEL</StylizedButton>
                        </Grid>
                        <Grid item xs={8}>
                            <Typography sx={{ textAlign: "center", fontWeight: "bold" }} variant="h5">{item.name} {useCurrencyRupiah(singleCost)}</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <StylizedButton onClick={handleSave} filled={true} variant="small">Save</StylizedButton>
                        </Grid>
                    </Grid>
                </Box>
                <Container sx={{display: "flex", flexDirection: "column", gap: 2, alignItems: "center", py:2}}>
                    {!(item.variants.length == 1 && item.variants[0].name == "default") && <Box sx={{px: 0, minWidth: "400px", width: "75%", borderTop: 2, borderColor: "grey.500"}}>
                        <Stack direction="row" alignItems="flex-end" spacing={1}>
                            <Typography sx={{fontWeight: "bold"}} variant="h6">Variant |</Typography>
                            <Typography variant="caption" color={"grey.500"}>Choose One</Typography>
                        </Stack>
                        <Grid container spacing={2}>
                            {item.variants.map((v,i) => (
                                <Grid key={i} item xs={6}>
                                    <StylizedButton onClick={() => handleVariantChange(v.id)} filled={v.id === selectedVariant}>{v.name}</StylizedButton>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>}
                    {
                        item.modifiers.map((modifier, modifierIndex) => (
                            <Box key={modifierIndex} sx={{px: 0, minWidth: "400px", width: "75%", borderTop: 2, borderColor: "grey.500"}}>
                                <Stack direction="row" alignItems="flex-end" spacing={1}>
                                    <Typography sx={{fontWeight: "bold"}} variant="h6">{modifier.name} |</Typography>
                                    <Typography variant="caption" color={"grey.500"}>{modifier.is_required ? "Required" : "Optional"}</Typography>
                                </Stack>
                                <Grid container spacing={2}>
                                    {modifier.modifier_options.map((options, optionsIndex) => (
                                        <Grid key={optionsIndex} item xs={6}>
                                            <StylizedButton onClick={() => handleModifierChange(options.id)} filled={selectedModifiers.includes(options.id)}>{options.name} {options.price ? `+${options.price}`:""}</StylizedButton>
                                        </Grid>
                                    ))}
                                </Grid>
                                {modifierErrors.includes(modifier.id) && <Typography sx={{ color: "red", textAlign: "center", my: "1px" }}>At least one option must be selected</Typography>}
                            </Box>
                        ))
                    }
                    <Box sx={{px: 0, minWidth: "400px", width: "75%", borderTop: 2, borderColor: "grey.500"}}>
                        <Stack direction="row" alignItems="flex-end" spacing={1}>
                            <Typography sx={{fontWeight: "bold"}} variant="h6">Quantity</Typography>
                        </Stack>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField 
                                    value={menuCount} 
                                    onChange={e => Number.isSafeInteger(+e.target.value) && setMenuCount(+e.target.value)} 
                                    fullWidth sx={{ border: 2, borderRadius: "8px", borderColor: "black" }} size="small" 
                                    inputProps={{ style: {textAlign: 'center', fontWeight: "bold"} }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <ButtonGroup fullWidth variant="text" size="medium" sx={{border: 2, borderColor: 'black', borderRadius: "8px", boxShadow: 2}}>
                                    <Button onClick={decrementMenuCount} sx={{lineHeight: "28px", color: 'black', fontWeight: 'bold', fontSize: 24}}>-</Button>
                                    <Button onClick={incrementMenuCount} sx={{lineHeight: "28px", color: 'black', fontWeight: 'bold', fontSize: 24, borderLeft: 2, borderColor: 'black'}}>+</Button>
                                </ButtonGroup>
                            </Grid>
                        </Grid>
                    </Box>
                    <Box sx={{px: 0, pb: 2, minWidth: "400px", width: "75%", borderTop: 2, borderColor: "grey.500"}}>
                        <Stack direction="row" alignItems="flex-end" spacing={1}>
                            <Typography sx={{fontWeight: "bold"}} variant="h6">Notes</Typography>
                        </Stack>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField value={menuNote} onChange={e => setMenuNote(e.target.value)} rows={2} placeholder="Add notes here" multiline fullWidth sx={{border: 2, borderRadius: '8px', borderColor: "black"}} size="small" />
                            </Grid>
                        </Grid>
                    </Box>
                    <Box sx={{px: 0, minWidth: "400px", width: "75%"}}>
                        {!createNew && <StylizedButton onClick={handleRemove} filled={true} variant="small">REMOVE</StylizedButton>}
                    </Box>
                </Container>
            </Box>
        </Modal>
    )
}

export default CustomizeMenu;