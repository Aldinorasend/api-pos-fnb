import React, { forwardRef } from 'react';
import { NumericFormat } from 'react-number-format';

const PercentFormatCustom = forwardRef((props, ref) => {
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
        suffix="%"
        valueIsNumericString={true}
      />
    );
  });

export default PercentFormatCustom;

