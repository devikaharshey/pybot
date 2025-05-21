export const getCodeString = (children: React.ReactNode): string => {
    if (typeof children === "string") return children;
    if (Array.isArray(children))
      return children.map((c) => getCodeString(c)).join("");
    if (typeof children === "object" && "props" in (children as { props: { children: React.ReactNode } }))
      return getCodeString((children as { props: { children: React.ReactNode } }).props.children);
    return "";
  };
  