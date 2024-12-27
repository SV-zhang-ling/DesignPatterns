// 对后台返回的仿射矩阵调整顺序适配web css3 Matrix
export const reverseMatrix = ([a, b, c, d, e, f]: number[]) => [
  a,
  d,
  b,
  e,
  c,
  f
];
