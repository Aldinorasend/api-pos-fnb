<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreModifierRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'is_required' => ['required', 'boolean'],
            'min_selected' => ['required', 'integer'],
            'max_selected' => ['required', 'integer'],
            'outlet_id' => ['required', 'exists:outlet,id'],
            'modifier_options' => ['required', 'array', 'min:1'], 
            'modifier_options.*.name' => ['required', 'string', 'max:255'], 
            'modifier_options.*.price' => ['required', 'integer'],
        ];
    }
}
