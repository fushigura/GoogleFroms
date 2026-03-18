import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Question { id?: string; text: string; type: string; options?: string[] }
export interface Form { id: string; title: string; description?: string; questions: Question[] }

const initialState: Form[] = [];

const slice = createSlice({
  name: 'forms',
  initialState,
  reducers: {
    setForms: (_state, action: PayloadAction<Form[]>) => action.payload,
    addForm: (state, action: PayloadAction<Form>) => { state.unshift(action.payload); },
    updateForm: (state, action: PayloadAction<Form>) => {
      const i = state.findIndex(f => f.id === action.payload.id);
      if (i >= 0) state[i] = action.payload;
    }
  }
});

export const { setForms, addForm, updateForm } = slice.actions;
export default slice.reducer;