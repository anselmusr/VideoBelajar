import { supabase } from './supabaseClient.js'
import { courseToRow, rowToCourse } from './courseMapping.js'

export async function fetchCoursesApi() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('id', { ascending: true })
  if (error) throw new Error(error.message)
  return data.map(rowToCourse)
}

export async function createCourseApi(courseData) {
  const row = courseToRow(courseData)
  delete row.id
  const { data, error } = await supabase.from('courses').insert(row).select().single()
  if (error) throw new Error(error.message)
  return rowToCourse(data)
}

export async function updateCourseApi(id, patch) {
  const row = courseToRow(patch)
  delete row.id
  const { data, error } = await supabase
    .from('courses')
    .update(row)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return rowToCourse(data)
}

export async function deleteCourseApi(id) {
  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function restoreCourseApi(course) {
  const { data, error } = await supabase
    .from('courses')
    .insert(courseToRow(course))
    .select()
    .single()
  if (error) throw new Error(error.message)
  return rowToCourse(data)
}
