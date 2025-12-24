"use client"

import { reduxStore } from "@/lib/store/store";
import { Provider } from "react-redux";

export const ReduxProvider = (props: React.PropsWithChildren) => {
    return (
        <Provider store={reduxStore}>
            {props.children}
        </Provider>
    );
};
