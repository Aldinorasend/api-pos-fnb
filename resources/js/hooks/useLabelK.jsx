/**
 * 
 * @param {Number} value 
 * @return {String}
 */

const useLabelK = (value) => {
    return value < 1000 ? `${value}` : `${Math.floor(value/1000)}K`
}

export default useLabelK