'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface FormContextType {
  isFormOpen: boolean
  openForm: (action?: 'vender' | 'comprar', initialProduct?: string) => void
  closeForm: () => void
  initialAction: 'vender' | 'comprar' | undefined
  initialProduct: string | undefined
}

const FormContext = createContext<FormContextType | undefined>(undefined)

export function FormProvider({ children }: { children: ReactNode }) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [initialAction, setInitialAction] = useState<'vender' | 'comprar' | undefined>(undefined)
  const [initialProduct, setInitialProduct] = useState<string | undefined>(undefined)

  const openForm = (action?: 'vender' | 'comprar', product?: string) => {
    setInitialAction(action)
    setInitialProduct(product)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setInitialAction(undefined)
    setInitialProduct(undefined)
  }

  return (
    <FormContext.Provider value={{ isFormOpen, openForm, closeForm, initialAction, initialProduct }}>
      {children}
    </FormContext.Provider>
  )
}

export function useForm() {
  const context = useContext(FormContext)
  if (context === undefined) {
    throw new Error('useForm must be used within a FormProvider')
  }
  return context
}
