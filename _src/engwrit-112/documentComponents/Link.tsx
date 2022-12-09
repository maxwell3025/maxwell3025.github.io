import * as React from "react";

export default function Link(properties: React.PropsWithChildren<{href: string}>){
    return <a href={properties.href} className="text-red-200 font-semibold">{properties.children}</a>
}