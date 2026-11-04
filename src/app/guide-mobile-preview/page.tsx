export default function GuideMobilePreview() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: "24px",
        background: "#252020",
      }}
    >
      <iframe
        title="معاينة دليل صحوة على الهاتف"
        src="/guide-visual-preview"
        style={{
          width: "390px",
          height: "844px",
          border: 0,
          borderRadius: "24px",
          background: "#f4ece5",
        }}
      />
    </main>
  );
}
