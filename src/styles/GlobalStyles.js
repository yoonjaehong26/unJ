/**
 * GlobalStyles - 다크/라이트 모드
 */
import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  :root {
    --bg-primary: #ffffff;
    --bg-secondary: #f5f5f5;
    --bg-card: #ffffff;
    --bg-hover: #eeeeee;
    
    --border-subtle: #e0e0e0;
    --border-active: #333333;
    
    --text-primary: #111111;
    --text-secondary: #666666;
    --text-muted: #999999;
    
    --accent: #4CAF50;
    --accent-light: #81C784;
  }

  [data-theme="dark"] {
    --bg-primary: #121212;
    --bg-secondary: #1e1e1e;
    --bg-card: #252525;
    --bg-hover: #333333;
    
    --border-subtle: #333333;
    --border-active: #ffffff;
    
    --text-primary: #ffffff;
    --text-secondary: #aaaaaa;
    --text-muted: #666666;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.5;
    transition: background 0.2s, color 0.2s;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: inherit;
    cursor: pointer;
  }
`;

export default GlobalStyles;
