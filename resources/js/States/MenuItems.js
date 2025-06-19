import { configureStore, createSlice } from "@reduxjs/toolkit";

const calculateMenuPrice = (item) => {
    const flatModifiers = item.modifiers.flatMap(v => v.modifier_options)
    const variantCost = item.variants.reduce((t,v) => t+(v.id == item.selectedVariant && v.price), 0);
    const modifierCost = flatModifiers.reduce((t,v) => t+(item.selectedModifiers.includes(v.id) && v.price), 0);
    return (variantCost + modifierCost) * item.count;
}

const calculateOrderTotal = (order) => {
    return order.reduce((t,v) => t + calculateMenuPrice(v),0)
}

const counterSlice = createSlice({
    name: "MenuItems",
    initialState: {
        data : []
    },
    reducers: {
        insertData: (state, action) => {
            const payload = JSON.parse(JSON.stringify(action.payload));
            payload.itemId = Date.now();
            state.data.push(payload);
            const total = calculateOrderTotal(state.data);  
            window.localStorage.setItem("Menu", JSON.stringify(state.data));
            window.localStorage.setItem("total", total);
        },

        updateData: (state, action) => {
            const idx = state.data.findIndex(d => d.itemId == action.payload.itemId);
            const payload = JSON.parse(JSON.stringify(action.payload));
            if (idx != -1) {
                state.data[idx] = payload;
                const total = calculateOrderTotal(state.data);  
                window.localStorage.setItem("Menu", JSON.stringify(state.data));
                window.localStorage.setItem('total', total)
            } 
        },

        deleteData: (state, action) => {
            let tmpData = window.localStorage.getItem("Menu");
            tmpData = JSON.parse(tmpData);
            tmpData = tmpData.filter(v => v.itemId != action.payload);
            state.data = tmpData;

            const total = calculateOrderTotal(state.data);  
            window.localStorage.setItem("Menu", JSON.stringify(state.data));
            window.localStorage.setItem('total', total)
        },

        getData : (state, action) => {
            let tmpData = window.localStorage.getItem("Menu");
            tmpData = JSON.parse(tmpData);

            state.data.pop();
            state.data.push(tmpData);
        },

        initializeData : (state) => {
            let tmpData = window.localStorage.getItem("Menu")

            if (tmpData != null) {
                state.data = JSON.parse(tmpData);
            }
        },

        resetData : (state) => {
            let data = []
            
            state.data =  data
            window.localStorage.setItem("Menu", JSON.stringify(data));
            window.localStorage.setItem("StatusOrder", false) 
            window.localStorage.setItem("total", 0)
        }
    }
})

const MenuItems = configureStore({
    reducer : counterSlice.reducer
})

export const {insertData, updateData, deleteData, getData, initializeData, resetData}  = counterSlice.actions
export const selectMenu = (state) => state.data;
export default MenuItems
