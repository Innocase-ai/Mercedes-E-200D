import * as React from "react"

declare module "react" {
    interface ComponentProps<T> {
        indicatorClassName?: string;
    }
}
