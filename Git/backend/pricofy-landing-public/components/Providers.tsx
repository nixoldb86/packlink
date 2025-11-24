'use client'

import { FormProvider } from '@/contexts/FormContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { useForm } from '@/contexts/FormContext'
import ProductForm from './ProductForm'

function FormContent({ children }: { children: React.ReactNode }) {
  const { isFormOpen, closeForm, initialAction, initialProduct } = useForm()

  return (
    <>
      {children}
      <ProductForm 
        isOpen={isFormOpen} 
        onClose={closeForm}
        initialAction={initialAction}
        initialProduct={initialProduct}
      />
    </>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <FormProvider>
          <FormContent>
            {children}
          </FormContent>
        </FormProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

