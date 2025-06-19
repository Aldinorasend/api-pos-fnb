/**
 * @param {number} value
 * @returns {string}
 */
const useCurrencyRupiah = (value) => {
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR"
  })
  let style1 = formatter.format(value)
  
  let style2 = `Rp ${value.toLocaleString('id-ID')}`

  return style2
}

export default useCurrencyRupiah