import { AddPhotoAlternate } from "@mui/icons-material";
import Clear from "@mui/icons-material/Clear";
import { Box, Modal, Typography, ButtonBase, Stack, Button, TextField, MenuItem, Select, InputLabel, FormControl, InputBase, FormControlLabel, Checkbox, FormGroup, FormHelperText, CircularProgress, Dialog, DialogContent, DialogTitle } from "@mui/material"
import { blue, red } from "@mui/material/colors";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import NumberFormatCustom from "../NumberFormatCustom";
import { usePage } from "@inertiajs/inertia-react";

function flattenObjectArray(array, name) {
    let result = [];

    array.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
            for (let key in item) {
                if (item.hasOwnProperty(key)) {
                    result.push({
                        key: `${name}[${index}][${key}]`,
                        value: item[key]
                    });
                }
            }
        } else {
            result.push({
                key: `${name}[${index}]`,
                value: item
            });
        }
    });

    return result;
}

const ModifyProduct = ({ api, open, onClose, availableCategories, availableModifiers, outlet, product }) => {
    const [image, setImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const [name, setName] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [description, setDescription] = useState("")

    const [price, setPrice] = useState("");
    const [variants, setVariants] = useState([]);
    const [selectedModifiers, setSelectedModifiers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { translations } = usePage().props;

    const [errors, setErrors] = useState(
        {
            name: {
                active: false,
                message: "Name cannot be empty!"
            },
            category: {
                active: false,
                message: "Category cannot be empty!"
            },
            description: {
                active: false,
                message: "Description cannot be empty!"
            },
            pricing: {
                active: false,
                message: "Product must have a price or complete variants"
            }
        }
    )

    const handleCancel = () => {
        onClose();
    }

    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(selectedFile);
            setImageFile(selectedFile);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImageFile(null);
        document.getElementById('imageUploadSelector').value = null;
    }

    const handleNameChange = (event) => {
        setName(event.target.value);
    }

    const handleSelectedCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    }

    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    }

    const handlePriceChange = (event) => {
        setPrice(event.target.value)
    }

    const handleAddVariant = () => {
        setVariants([
            ...variants,
            {
                name: "",
                price: "",
            }
        ])
    }

    const handleUpdateVariant = (event, index) => {
        const data = [...variants];
        if (event.target.name == "name") {
            data[index] = {
                ...data[index],
                name: event.target.value
            }
        } else if (event.target.name == "price") {
            data[index] = {
                ...data[index],
                price: event.target.value
            }
        }

        setVariants(data)
    }

    const handleDeleteVariant = (index) => {
        const data = [...variants];
        data.splice(index, 1);
        setVariants(data)
    }

    const handleChangeModifiers = (event) => {
        if (event.target.checked) {
            setSelectedModifiers([...selectedModifiers, +event.target.name])
        } else {
            setSelectedModifiers(selectedModifiers.filter(v => v != +event.target.name))
        }
    }

    const resetStates = () => {
        setImage(null);
        setImageFile(null);
        setName("");
        setSelectedCategory("");
        setDescription("");
        setPrice("");
        setVariants([]);
        setSelectedModifiers([]);
        let newErrors = { ...errors };
        newErrors.name.active = false;
        newErrors.category.active = false;
        newErrors.description.active = false;
        newErrors.pricing.active = false;
        setErrors(newErrors);
    };

    const loadStates = () => {
        if (!product) return;
        setName(product.name);
        setDescription(product.description);
        setSelectedCategory(availableCategories.filter(v => v.id == product.category_id)[0]);
        if (product.variants) {
            if (product.variants.length == 1 && product.variants[0].name == "default") {
                setPrice(product.variants[0].price);
            } else {
                setVariants(product.variants);
            }
        } else {
            setVariants([]);
        }

        setSelectedModifiers(product.modifiers ? product.modifiers.map(v => v.id) : []);
        if (product.image) {
            setImage(`${api}storage/${product.image}`)
        }
    }

    const validate = () => {
        let isValid = true;
        let newErrors = { ...errors };

        // Validate name
        if (name.trim() === "") {
            newErrors.name.active = true;
            isValid = false;
        } else {
            newErrors.name.active = false;
        }

        // Validate category
        if (!selectedCategory) {
            newErrors.category.active = true;
            isValid = false;
        } else {
            newErrors.category.active = false;
        }

        // Validate description
        if (description.trim() === "") {
            newErrors.description.active = true;
            isValid = false;
        } else {
            newErrors.description.active = false;
        }

        // Validate pricing
        if ((!price && variants.length === 0) || variants.some(item => Object.values(item).some(value => value === "" || value === null))) {
            newErrors.pricing.active = true;
            isValid = false;
        } else {
            newErrors.pricing.active = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSave = async () => {
        if (!validate()) return;
        const formdata = new FormData();
        formdata.append("name", name);
        formdata.append("category_id", selectedCategory.id);
        formdata.append("description", description);
        if (imageFile) {
            formdata.append("image", imageFile);
        }
        if (variants.length == 0) {
            formdata.append("price", price);
        } else {
            flattenObjectArray(variants, "variants").forEach(v => formdata.append(v.key, v.value));
        }
        flattenObjectArray(selectedModifiers, "modifiers").forEach(v => formdata.append(v.key, v.value));
        if (!product) {
            formdata.append("outlet_id", outlet.id);
            formdata.append("is_active", 1);
        } else {
            formdata.append("is_active", product.is_active);
        }

        if (product && !image) {
            formdata.append("remove_image", 1);
        }


        try {
            setIsLoading(true);
            const data = await fetch(`${api}api/product${product ? `/${product.id}?_method=PUT` : ""}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
                },
                body: formdata,
            })
            if (data.status == 422) throw "error";
            onClose();
            Swal.fire(
                'Success!',
                product ? 'Menu Has Been Updated' : 'Menu Has Been Created',
                'success'
            );
        } catch (error) {
            console.log("Error Saving")
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        setIsLoading(true);
        resetStates();
        loadStates();
        setIsLoading(false)
    }, [open, product])

    if (isLoading) {
        return (
            <Dialog open={open} onClose={handleCancel}>
            <DialogTitle textAlign="center" variant='h5' fontWeight={600}>{product ? translations.edit_product : translations.create_product}</DialogTitle>
            <DialogContent>
                <Stack sx={{ justifyContent: "center", alignItems: "center" }}>
                    <Box sx={{ display: 'flex' }}>
                        <CircularProgress />
                    </Box>
                </Stack>
            </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onClose={handleCancel}>
            <DialogTitle textAlign="center" variant='h5' fontWeight={600}>{product ? translations.edit_product : translations.create_product}</DialogTitle>
            <DialogContent sx={{ minWidth: { xs: '400px', sm: '360px', md: '600px' } }}>

                <Typography sx={{ borderBottom: 2, borderColor: "grey.300", color: "GrayText", fontWeight: 600, mb: 2 }}>GENERAL INFORMATION</Typography>
                <Stack sx={{ mx: 2 }} direction="row" gap={3}>
                    <Stack sx={{ alignItems: "center" }}>
                        <input

                            type="file"
                            style={{ display: 'none' }}
                            id="imageUploadSelector"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        <label htmlFor="imageUploadSelector">
                            {image ?
                                <img src={image} alt="Uploaded" style={{ width: "150px", height: "150px", objectFit: "cover" }} /> :
                                <Stack sx={{ width: "150px", height: "150px", justifyContent: "center", alignItems: "center", bgcolor: "grey.300" }}>
                                    <AddPhotoAlternate sx={{ color: "grey.500" }} />
                                </Stack>
                            }
                        </label>
                        {image && <ButtonBase onClick={handleRemoveImage} sx={{ bgcolor: "red", borderRadius: 64, px: 2, py: "1px" }}>
                            <Typography sx={{ color: "white" }}>REMOVE</Typography>
                        </ButtonBase>}
                    </Stack>
                    <Stack sx={{ flexGrow: 1 }} gap={2}>
                        <TextField
                            value={name}
                            label="Name"
                            variant="outlined"
                            onChange={handleNameChange}
                            error={errors.name.active}
                            helperText={errors.name.active && errors.name.message}
                        />
                        <FormControl
                            error={errors.category.active}
                        >
                            <InputLabel id="category-select-label">Category</InputLabel>
                            <Select
                                id="category-select"
                                labelId="category-select-label"
                                value={selectedCategory}
                                label="Category"
                                onChange={handleSelectedCategoryChange}
                            >
                                {availableCategories.map((v, i) =>
                                    <MenuItem key={i} value={v}>{v.category_name}</MenuItem>
                                )}
                            </Select>
                            {errors.category.active && <FormHelperText htmlFor="category-select">{errors.category.message}</FormHelperText>}
                        </FormControl>
                        <TextField
                            value={description}
                            label="Description"
                            variant="outlined"
                            multiline
                            rows={3}
                            onChange={handleDescriptionChange}
                            error={errors.description.active}
                            helperText={errors.description.active && errors.description.message}
                        />
                    </Stack>
                </Stack>
                <Typography sx={{ borderBottom: 2, borderColor: "grey.300", color: "GrayText", fontWeight: 600, my: 2 }}>PRICING</Typography>
                <Box sx={{ mx:2, border: 1, borderColor: errors.pricing.active ? "red" : "grey.300", borderRadius: 2, overflow: "hidden" }}>
                    <Stack>
                        {(variants.length == 0) && <InputBase
                            sx={{ p: 1, borderBottom: 1, borderColor: "grey.300", flexGrow: 1 }}
                            name="price"
                            placeholder="Price"
                            value={price}
                            onChange={handlePriceChange}
                            inputComponent={NumberFormatCustom}
                        />}
                        {variants.map((v, i) => (
                            <Stack key={i} direction="row">
                                <InputBase
                                    sx={{ p: 1, borderBottom: 1, borderColor: "grey.300", flexGrow: 1 }}
                                    name="name"
                                    placeholder="Variant Name"
                                    value={v.name}
                                    onChange={e => handleUpdateVariant(e, i)}
                                />

                                <Stack direction="row" sx={{ p: 1, borderBottom: 1, borderLeft: 1, borderColor: "grey.300", flexGrow: 1, alignItems: "center" }}>
                                    <InputBase
                                        sx={{ flexGrow: 1 }}
                                        name="price"
                                        placeholder="Price"
                                        value={v.price}
                                        onChange={e => handleUpdateVariant(e, i)}
                                        inputComponent={NumberFormatCustom}
                                    />
                                    <ButtonBase sx={{ p: 1, width: "20px", height: "20px", borderRadius: "20px", bgcolor: red[600] }} onClick={() => handleDeleteVariant(i)}>
                                        <Clear sx={{ width: "16px", color: "white" }} />
                                    </ButtonBase>
                                </Stack>
                            </Stack>
                        ))}
                    </Stack>
                    <ButtonBase sx={{ bgcolor: blue[500], width: "100%", p: 1 }} onClick={handleAddVariant}>
                        <Typography sx={{ color: "white" }}>ADD VARIANT</Typography>
                    </ButtonBase>
                </Box>
                {errors.pricing.active && <Typography sx={{ color: "red", textAlign: "center", my: "1px", fontSize: "0.75rem" }}>{errors.pricing.message}</Typography>}
                <Typography sx={{ borderBottom: 2, borderColor: "grey.300", color: "GrayText", fontWeight: 600, mt: 2 }}>MODIFIER</Typography>
                <FormControl sx={{ mx: 2 }} component="fieldset" variant="standard">
                    <FormGroup>
                        {
                            availableModifiers.map((v,i) => (
                                <FormControlLabel
                                    key={i}
                                    control={
                                        <Checkbox checked={selectedModifiers.includes(v.id)} onChange={handleChangeModifiers} name={`${v.id}`} />
                                    }
                                    label={<Typography sx={{ fontWeight: "bold", fontSize: "1.25rem" }}>{v.name}</Typography>}
                                />
                            ))
                        }
                    </FormGroup>
                </FormControl>
                <Stack direction={"row-reverse"} gap={2}>
                    <Button onClick={handleSave} color="primary" variant="contained">{translations.save}</Button>
                    <Button onClick={handleCancel} variant="text">{translations.cancel}</Button>
                </Stack>
            </DialogContent>
        </Dialog>
    )
}

export default ModifyProduct