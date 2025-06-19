import * as React from 'react';
import Grid from '@mui/material/Grid';
import ButtonBase from '@mui/material/ButtonBase';
import AddIcon from "@mui/icons-material/Add"
import useLabelK from '@/hooks/useLabelK';
import { useDispatch, useSelector } from 'react-redux';
import { initializeData, selectMenu, pushData, resetData } from '@/States/MenuItems';
import CustomizeMenu from './CustomizeMenu';
import { Chip, useTheme } from '@mui/material';

export default function CardMenu({ val }) {
  const theme = useTheme();

  const KPrice = React.useMemo(
    () => {
      let price = val.price
      if (!price) {
        price = val.variants.reduce((min, variant) => (variant.price < min ? variant.price : min), val.variants[0].price)
      }
      return useLabelK(price);
    }, [val]
  );
  const menu = useSelector(selectMenu)
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    dispatch(initializeData())
  }, [])

  const handleClick = () => {
    setModalOpen(true);
  }

  return (
    <Grid container direction={"row"} justifyContent={"space-between"} alignItems={"center"} sx={{ backgroundColor: "white", borderRadius: "12px", minWidth: "330px", maxWidth: "330px", minHeight: "80px", border: "1px solid rgba(0, 0, 0, 0.23)", borderRight: "none" }} >
      <CustomizeMenu open={modalOpen} onClose={()=>setModalOpen(false)} item={val}/>
      <Grid item md={7}>
        <h3 style={{ paddingLeft: "5px", margin: "5px" }}>
          {val.name}
          {val.is_active !== 1 && (
            <div>
              <Chip color="error" size="small" label="Sold Out" sx={{ marginBottom:'2px' }}/>
            </div>
          )}
        </h3>
      </Grid>
      <Grid item>
        <h3>{KPrice}</h3>
      </Grid>
      <Grid item sx={{ height: "100%" }}>
        <ButtonBase onClick={handleClick} disabled={val.is_active !== 1} sx={{ width: 60, height: '100%',borderRadius: "12px", backgroundColor: theme.palette.primary.main }}>
          <AddIcon sx={{ color: "white", fontSize: 30 }} />
        </ButtonBase>
      </Grid>
  </Grid>
  );
}