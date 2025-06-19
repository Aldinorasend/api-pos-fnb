import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from "@/Components/User/CardItem"
import Grid from '@mui/material/Grid';
import CardMenu from '@/Components/User/CardMenu';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { ButtonBase, Stack, TextField, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import User from '@/Layouts/User';
import { styled, useTheme } from '@mui/material/styles';
import { StorefrontRounded } from '@mui/icons-material';
import React from 'react';
import { usePage } from '@inertiajs/inertia-react';

const CustomTab = styled(Tab)(({ theme }) => ({
  backgroundColor: 'white',
  color: 'black',
  fontWeight: 700,
  border: '1px solid rgba(0, 0, 0, 0.23)',
  borderRadius: '12px',
  marginRight: '15px',
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
}));

const CustomTextFieldSearch = styled(TextField)(({ theme }) => ({
  borderRadius: 12,
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
  },
}));

export default function Main(props) {
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [outlets, setOutlets] = useState([]);
  const [menu, setMenu] = useState([]);
  const [search, setSearch] = useState("");
  const [searchMenu, setSearchMenu] = useState([]);
  const [category, setCategory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [value, setValue] = useState("*");
  const theme = useTheme();
  const { translations} = usePage().props;

  const getOutletsData = async () => {
    try {
      const response = await fetch(`${props.api}api/outlet/current/user`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
        },
      });
      const json = await response.json();

      const outletsWithImageUrls = json.data.map(outlet => ({
        ...outlet,
        image_url: outlet.image ? `${props.api}storage/${outlet.image}` : null
      }));

      setOutlets(outletsWithImageUrls);
    } catch (error) {
      console.error("Error fetching outlets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProductData = async () => {
    const data = await fetch(`${props.api}api/product/ext/outlet/${selectedOutlet.id}?order=name&sort=asc`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
      },
    })
    const json = await data.json()

    setMenu(json.data.reverse())
    setSearchMenu(json.data.reverse())
  }

  const getCategoryData = async () => {
    const data = await fetch(`${props.api}api/category/outlet/${selectedOutlet.id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
      },
    })
    const json = await data.json()

    setCategory(json.data.reverse())
    setIsLoading(false);
  }

  useEffect(() => {
    getOutletsData();
  }, [])

  useEffect(() => {
    if (selectedOutlet) {
      setIsLoading(true);
      getProductData();
      getCategoryData();
    }

  }, [selectedOutlet])

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleClickSearchIcon = () => {
    setSearch("");
    setSearchMenu(menu)
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    if (e.target.value == "") {
      setSearchMenu(menu)
      return;
    }
    let searchWord = e.target.value.toLowerCase()

    let searchResult = menu.filter((word) => {
      return word.name.toLowerCase().includes(searchWord)
    })

    setSearchMenu(searchResult)
  }

  if (!selectedOutlet) {
    return (
      <User title="" token={props.csrf} api={props.api} printer_api={props.printer_api} userType={props.auth.user.role_id}>
        <Stack sx={{ justifyContent: 'center', alignItems: 'center', height: '75vh' }}>
          <Typography variant='h4' color={'primary'} sx={{ fontWeight: "bold", m: 4 }}>Choose Outlet</Typography>
          <Stack sx={{ justifyContent: 'center', flexWrap: 'wrap', direction: 'row', gap: 4 }} direction="row">
            {outlets.length === 0 ? (
              <CircularProgress />
            ) : (
              outlets.map((outlet, index) => (
                <ButtonBase
                  sx={{ bgcolor: 'white', border: 2, borderColor: theme.palette.primary.main, borderRadius: '20px' }}
                  key={outlet.id}
                  onClick={() => setSelectedOutlet(outlet)}
                >
                  <Stack sx={{ width: 150, height: 150, alignItems: 'center', justifyContent: 'center' }}>
                    {outlet.image_url ? (
                      <img
                        src={outlet.image_url}
                        alt={outlet.outlet_name}
                        style={{ width: 100, height: 100, objectFit: 'cover', margin: 2 }}
                      />
                    ) : (
                      <StorefrontRounded sx={{ fontSize: 48, color: "#a52a2a", margin: 2 }} />
                    )}
                    <Typography color={'primary'} sx={{ fontWeight: "bold"}}>{outlet.outlet_name}</Typography>
                  </Stack>
                </ButtonBase>
              ))
            )}
          </Stack>
        </Stack>
      </User>
    );
  }

  return (
      <User title="" leftDrawer token={props.csrf} api={props.api} printer_api={props.printer_api} userType={props.auth.user.role_id} outlet={selectedOutlet}>
        <Typography color={'primary'} fontWeight={'700'} sx={{ fontSize:'38px' }}>{translations.create_order}</Typography>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabContext value={value}>
              <Box style={{ textAlign: 'right', position: 'absolute', top: 0, right: '21%', width: '17%', zIndex: 2, marginTop: '35px' }}>
                <CustomTextFieldSearch fullWidth value={search} label="Search Menu" variant='outlined' onChange={handleSearchChange} style={{ backgroundColor: 'white'}} 
                  InputProps={{
                    endAdornment: 
                      <InputAdornment position="end">
                        <IconButton onClick={handleClickSearchIcon} edge="end">
                          {search === "" ? <SearchIcon /> : <ClearIcon />}
                        </IconButton>
                      </InputAdornment>,
                  }}
                />
              </Box>

              <Box sx={{ borderBottom: 1, borderColor: "transparent", paddingTop: '38px', paddingBottom:'10px', position:'sticky', top:0, backgroundColor: '#f5f5f5', zIndex: 1 }}>
                <TabList onChange={handleChange} aria-label="Category" TabIndicatorProps={{ style: { display: 'none' } }}>
                  <CustomTab label={"All"} value={"*"} />
                  {
                    category.map((val, idx) => {
                      return (
                        <CustomTab label={val.category_name} key={idx} value={val.id} />
                      )
                    })
                  }
                </TabList>
              </Box>
              
              <Box sx={{ flexGrow: 1, lineHeight: 1.2, marginTop: 3 }}>
                <TabPanel sx={{ paddingLeft: 0, paddingTop: 0 }} value="*">
                  <Grid sx={{ marginLeft: 0, gap: '24px' }} container columns="row" spacing={1}>
                    {searchMenu.map((item, idx) => (
                      <CardMenu key={idx} val={item} />
                    ))}
                  </Grid>
                </TabPanel>
                {category.map((cat) => (
                  <TabPanel sx={{ paddingLeft: 0, paddingTop: 0 }} key={cat.id} value={cat.id}>
                    <Grid sx={{ marginLeft: 0, gap: '24px' }} container columns="row" spacing={1}>
                      {searchMenu
                        .filter((item) => item.category_id === cat.id)
                        .map((item, idx) => (
                          <CardMenu key={idx} val={item} />
                        ))}
                    </Grid>
                  </TabPanel>
                ))}
              </Box>
            </TabContext>
          </>
        )}
    </User>
  );
}
