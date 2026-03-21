export const getPosts = () => {
  try { return JSON.parse(localStorage.getItem('bt_posts') || '[]') } catch { return [] }
}
export const savePosts = (posts) => localStorage.setItem('bt_posts', JSON.stringify(posts))
export const isAuthed  = () => sessionStorage.getItem('bt_auth') === '1'
export const setAuth   = (v) => v ? sessionStorage.setItem('bt_auth','1') : sessionStorage.removeItem('bt_auth')
export const uid = () => 'b_' + Math.random().toString(36).slice(2,9)
