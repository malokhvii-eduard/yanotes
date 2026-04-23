type ValidationFieldState = {
  errors: readonly string[]
}

export const fieldErrorProps = {
  props: (state: ValidationFieldState) => ({
    errorMessages: state.errors
  })
}
