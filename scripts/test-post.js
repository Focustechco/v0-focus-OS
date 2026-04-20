async function run() {
  const res = await fetch("http://localhost:3000/api/checklist-items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task_id: "00000000-0000-0000-0000-000000000000",
      project_id: "00000000-0000-0000-0000-000000000000",
      items: [{ title: "Test Item", assigned_to: "" }]
    })
  });
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}
run();
