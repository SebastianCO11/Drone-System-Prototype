// checkRole.js
export function checkRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ error: 'User not authenticated' })

    if (!rolesPermitidos.includes(req.user.role))
      return res.status(403).json({ error: 'Access denied: insufficient role' })

    next()
  }
}
