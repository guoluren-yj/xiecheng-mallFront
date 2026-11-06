export function getBudgetColumns({ columns }) {
  return columns.filter((c) => c.name !== 'action');
}

export function getButtons() {
  return [];
}
