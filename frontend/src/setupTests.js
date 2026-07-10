// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
// Explicitly polyfill the missing internal router module for Jest environment
import '@testing-library/jest-dom';

// Completely mock react-router-dom globally for all unit tests
jest.mock('react-router-dom', () => {
  const React = require('react');
  return {
    ...jest.requireActual('react-router-dom'),
    BrowserRouter: ({ children }) => <div>{children}</div>,
    Routes: ({ children }) => <div>{children}</div>,
    Route: ({ element }) => element,
    Navigate: ({ to }) => <div data-testid="navigate" data-to={to} />,
    Outlet: () => <div data-testid="outlet" />,
    useNavigate: () => jest.fn(),
    useLocation: () => ({ pathname: '/' }),
  };
});
import '@testing-library/jest-dom';
