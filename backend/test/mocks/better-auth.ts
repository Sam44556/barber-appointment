export const betterAuth = jest.fn().mockReturnValue({
  api: {
    signUpEmail: jest.fn(),
    signInEmail: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
  }
});
