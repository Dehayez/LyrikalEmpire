import '@testing-library/jest-dom/extend-expect';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { TextEncoder, TextDecoder } from 'util';

configure({ adapter: new Adapter() });

// Polyfill TextEncoder and TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Create a div element with id 'root' and append it to the document body
const root = document.createElement('div');
root.setAttribute('id', 'root');
document.body.appendChild(root);