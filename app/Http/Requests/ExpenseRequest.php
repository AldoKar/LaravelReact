<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExpenseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|gt:0',
            'category' => 'required|in:Alimentación,Transporte,Entretenimiento,Salud,Educación,Hogar,Ropa,Otros',
            'description' => 'nullable|string|max:255',
            'date' => 'required|date',
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'amount.required' => 'El monto es obligatorio.',
            'amount.numeric' => 'El monto debe ser un número.',
            'amount.gt' => 'El monto debe ser mayor a cero.',
            'category.required' => 'Selecciona una categoría.',
            'category.in' => 'La categoría seleccionada no es válida.',
            'description.max' => 'La descripción no puede exceder 255 caracteres.',
            'date.required' => 'La fecha es obligatoria.',
            'date.date' => 'La fecha no es válida.',
        ];
    }
}
