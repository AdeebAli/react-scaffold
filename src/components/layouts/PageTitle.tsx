const APP_NAME = 'React Scaffold'

export type PageTitleProps = {
  /** The page's own title. Omit on the home page to show just the app name. */
  title?: string
}

/** Sets the document title. React 19 hoists `<title>` into `<head>`. */
export function PageTitle({ title }: PageTitleProps) {
  return <title>{title ? `${title} · ${APP_NAME}` : APP_NAME}</title>
}
