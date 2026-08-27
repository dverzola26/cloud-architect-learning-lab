export const metadata = {
  title: 'Cloud Architect Learning Lab',
  description: 'Guided hands-on cloud-native learning program'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
