// NumberFormatCustom.js

import React, { forwardRef } from 'react';
import { NumericFormat } from 'react-number-format';

const NumberFormatCustom = forwardRef((props, ref) => {
    const { onChange, ...other } = props;
    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          onChange({
            target: {
              name: props.name,
              value: values.value,
            },
          });
        }}
        thousandSeparator="."
        decimalSeparator=","
        prefix="Rp "
        valueIsNumericString={true}
      />
    );
  });

export default NumberFormatCustom;