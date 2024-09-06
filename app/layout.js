"use client";

import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Provider } from "react-redux";
import store from "@/store";
import { GlobalContextProvider } from "./context/store";

const space = Space_Grotesk({ subsets: ['latin'], weight: ['400', '700'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Alemeno Assignment</title>
        <meta name='description' content='Description' />
      </head>
      <body className={space.className}>
        <Provider store={store}>
          <GlobalContextProvider>
            {children}
          </GlobalContextProvider>
        </Provider>
      </body>
    </html>
  );
}
