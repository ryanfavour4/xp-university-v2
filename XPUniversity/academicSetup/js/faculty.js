const addFacultyForm = document.getElementById('addFacultyForm');
let faculties = [];


const renderTable = (data) => {
  let facultiesDT = data ? data : faculties;

  const table = document.getElementById('table-body');
  table.innerHTML = '';
  facultiesDT.forEach((faculty, id) => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${id + 1}</td>
        <td>${faculty.Name}</td>
        <td>${faculty.UniqueId}</td>
        <td>${faculty.Code}</td>
        <td>${faculty.Status == 1 ? '<div class="text-success">Active</div>' : '<div class="text-danger">Inactive<div>'}</td>
        <td>
          <button
            data-toggle="modal"
            data-target="#editModal" 
            class="btn btn-primary"
            onclick="populateEditFacultyPopup(${id})"
          >Edit</button>
          <button class="btn btn-danger" onclick="deleteFaculty(${id})">Delete</button>
        </td>
      `;
    table.appendChild(row);
  });
};


/**
 * Populates the table with faculties
 * gotten from the server
 */
const populate = async () => {
  try {
    const response = await axios.get('http://192.168.17.220:8097/api/v1/faculties');
    const data = response.data;
    faculties = [...data];
    renderTable();
  } catch (error) {
    console.log(error);
  }

}

// Populates page when DOM is loaded
document.addEventListener('DOMContentLoaded', populate);

const addFaculty = async (e) => {
  e.preventDefault();
  const formData = new FormData(addFacultyForm);
  const data = Object.fromEntries(formData.entries());
  // validate checkbox
  if (data.Status) {
    data.Status = 1;
  } else {
    data.Status = 0;
  }
  console.log(data);

  const validate = new Validate();
  validate.length(data.Name, 3, 50, 'Name');
  validate.length(data.UniqueId, 3, 10, 'UniqueId');
  validate.length(data.Code, 3, 10, 'Code');

  if (validate.errors.length > 0) {
    console.log(validate.errors[0]);
    return;
  }

  try {
    const res = await axios.post('http://192.168.17.220:8097/api/v1/faculties/add', data)

    console.log("success")
    console.log(res)
    window.location.reload();
  } catch (error) {
    const errDiv = document.createElement('div');
    errDiv.className = 'alert alert-danger';
    errDiv.innerHTML = error.response.data.Error;
    addFacultyForm.prepend(errDiv);
  }
}

const populateEditFacultyPopup = (index) => {
  const editForm = document.getElementById('editForm');
  const faculty = { ...faculties[index] };
  editForm.innerHTML = `
    <div class="form-group">
      <label for="facultyName">Faculty Name</label>
      <input type="text" class="form-control" name="Name" id="facultyName" placeholder="e.g. Faculty of Art" value="${faculty.Name.trim()}">
    </div>
    <div class="form-group">
      <label for="code">Code</label>
      <input type="text" class="form-control" name="Code" id="code" placeholder=" e.g. 04" value="${faculty.Code.trim()}">
    </div>
    <div class="form-group">
      <label for="uniqueId">Unique ID</label>
      <input type="text" class="form-control" name="UniqueId" id="uniqueId" placeholder="e.g g8yu8" value="${faculty.UniqueId.trim()}">
    </div>
    <div class="form-group">
      <div class="form-check">
        <input 
          class="form-check-input" 
          name="Status" 
          type="checkbox" 
          id="status"
          ${faculty.Status == 1 ? 'checked' : ''}
        >
        <label class="form-check-label" for="status">
          Is active
        </label>
      </div>
    </div>
    <button 
      type="button"
      data-dismiss="modal"
      class="btn btn-primary float-right"
      onclick="updateFaculty(${index})"
    >Update</button>`
}

const deleteFaculty = (index) => {
  const container = document.getElementById('container-table-wrap');
  const faculty = faculties[index];
  try {
    axios.delete(`http://192.168.17.220:8097/api/v1/faculties/${faculty.FacultyId}`)
    const newDiv = document.createElement('div');
    newDiv.className = 'alert alert-success';
    newDiv.innerHTML = 'Faculty deleted successfully';
    container.prepend(newDiv);
    faculties.splice(index, 1);
    renderTable();
    setTimeout(() => {
      newDiv.remove();
    }, 5000);
    // window.location.reload();
  } catch (error) {
    console.log(error);
  }
}

const updateFaculty = async (index) => {
  const editForm = document.getElementById('editForm');
  const formData = new FormData(editForm);
  const data = Object.fromEntries(formData.entries());
  // validate checkbox
  if (data.Status) {
    data.Status = 1;
  } else {
    data.Status = 0;
  }

  const validate = new Validate();
  validate.length(data.Name, 3, 50, 'Name');
  validate.length(data.UniqueId, 3, 10, 'UniqueId');
  validate.length(data.Code, 2, 10, 'Code');

  if (validate.errors.length > 0) {
    console.log(validate.errors[0]);
    return;
  }

  const faculty = faculties[index];
  data.FacultyId = faculty.FacultyId;

  try {
    await axios.put(`http://192.168.17.220:8097/api/v1/faculties`, data);
    faculties[index] = data;
    renderTable();
    $('#editModal').modal('hide');
  } catch (error) {
    console.log(error);
  }


}

const search = async (e) => {
  e.preventDefault();
  const formData = new FormData(searchForm);
  const data = Object.fromEntries(formData.entries());
  data.Status = Number(data.Status);
  try {
    const res = await axios.post('http://192.168.17.220:8097/api/v1/faculties', data);
    renderTable(res.data);
    $('#searchModal').modal('hide');
    $('#reset-btn').show();
    // remove class d-none from reset button
    $('#reset-btn').removeClass('d-none');
    
  } catch (error) {
    console.log(error);
  }
}

const reset = () => {
  renderTable();
  $('#reset-btn').hide();
}