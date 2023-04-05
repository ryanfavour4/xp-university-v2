const addDepartmentForm = document.getElementById('addDepartmentForm');
let departments = [];
let faculties = [];


const renderTable = (data) => {
  let departmentsDT = data ? data : departments;

  const tableBody = document.getElementById('table-body');
  tableBody.innerHTML = '';
  departmentsDT.forEach((department, id) => {
    const Faculty = faculties.find(faculty => faculty.FacultyId === department.FacultyId);
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${id + 1}</td>
        <td>${department.Name}</td>
        <td>${Faculty.Name}</td>
        <td>${department.UniqueId}</td>
        <td>${department.Code}</td>
        <td>${department.Status == 1 ? '<div class="text-success">Active</div>' : '<div class="text-danger">Inactive<div>'}</td>
        <td>
          <button
            data-toggle="modal"
            data-target="#editModal" 
            class="btn btn-primary"
            onclick="populateEditDepartmentPopup(${id})"
          >Edit</button>
          <button class="btn btn-danger" onclick="deleteDepartment(${id})">Delete</button>
        </td>
      `;
    tableBody.appendChild(row);
  });
};


/**
 * Populates the table with departments
 * gotten from the server
 */
const populate = async () => {
  try {
    const response = await axios.get('http://localhost:8097/api/v1/departments');
    const data = response.data;
    departments = [...data];
    const response2 = await axios.get('http://localhost:8097/api/v1/faculties');
    const data2 = response2.data;
    faculties = [...data2];
  } catch (error) {
    departments = [];
    faculties = [];
  } finally {
    renderTable();
    fillInDropdowns();
  }
}

const fillInDropdowns = async () => {
  let facultySelects = document.querySelectorAll('.facultySelect'); 
  let selectHtml = '';
  facultySelects.forEach(facultySelect => {
    faculties.forEach(faculty => {
      selectHtml += `<option value="${faculty.FacultyId}">${faculty.Name}</option>`;
    });
    facultySelect.innerHTML += selectHtml;
    selectHtml = '';
  });
}



// Populates page when DOM is loaded
document.addEventListener('DOMContentLoaded', populate);












const addDepartment = async (e) => {
  e.preventDefault();
  const formData = new FormData(addDepartmentForm);
  const errDiv = document.createElement('div');
  errDiv.className = 'alert alert-danger';

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
  validate.choseOne(data.FacultyId, 'Faculty');
  if (validate.errors.length > 0) {
    errDiv.innerHTML = validate.errors[0];
    addDepartmentForm.prepend(errDiv);
    setTimeout(() => {
      errDiv.remove();
    }, 3000);
    return;
  }

  data.FacultyId = Number(data.FacultyId);

  try {
    const res = await axios.post('http://localhost:8097/api/v1/departments/add', data)
    for (const element in e.target.elements) {
      if (e.target.elements[element].value) {
        e.target.elements[element].value = '';
      }
    }
    window.location.reload();
  } catch (error) {
    errDiv.innerHTML = error.response.data.Error;
    addDepartmentForm.prepend(errDiv);
  }
}

const populateEditDepartmentPopup = (index) => {
  const editForm = document.getElementById('editForm');
  const department = { ...departments[index] };

  facultyOptions = ''
  faculties.forEach(faculty => {
    facultyOptions += `<option value="${faculty.FacultyId}" ${faculty.FacultyId === department.FacultyId ? "selected" : ""}>${faculty.Name}</option>`
  })

  editForm.innerHTML = `
    <div class="form-group">
      <label for="facultyName">Faculty Name</label>
      <select class="form-control" name="FacultyId" id="facultyName">
        <option value="">Select Faculty</option>
        ${facultyOptions}
      </select>
    </div>
    <div class="form-group">
      <label for="departmentName">Department Name</label>
      <input type="text" class="form-control" name="Name" id="departmentName" placeholder="e.g. Department of Art" value="${department.Name.trim()}">
    </div>
    <div class="form-group">
      <label for="code">Code</label>
      <input type="text" class="form-control" name="Code" id="code" placeholder=" e.g. 04" value="${department.Code.trim()}">
    </div>
    <div class="form-group">
      <label for="uniqueId">Unique ID</label>
      <input type="text" class="form-control" name="UniqueId" id="uniqueId" placeholder="e.g g8yu8" value="${department.UniqueId.trim()}">
    </div>
    <div class="form-group">
      <div class="form-check">
        <input 
          class="form-check-input" 
          name="Status" 
          type="checkbox" 
          id="status"
          ${department.Status == 1 ? 'checked' : ''}
        >
        <label class="form-check-label" for="status">
          Is active
        </label>
      </div>
    </div>
    <button 
      type="button"
      class="btn btn-primary float-right"
      onclick="updateDepartment(${index})"
    >Update</button>`
}

const deleteDepartment = (index) => {
  const container = document.getElementById('container-table-wrap');
  const department = departments[index];
  try {
    axios.delete(`http://localhost:8097/api/v1/departments/${department.DepartmentId}`)
    const newDiv = document.createElement('div');
    newDiv.className = 'alert alert-success';
    newDiv.innerHTML = 'Department deleted successfully';
    container.prepend(newDiv);
    departments.splice(index, 1);
    renderTable();
    setTimeout(() => {
      newDiv.remove();
    }, 5000);
    // window.location.reload();
  } catch (error) {
  }
}

const updateDepartment = async (index) => {
  const editForm = document.getElementById('editForm');
  const errDiv = document.createElement('div');
  errDiv.className = 'alert alert-danger';

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
  validate.choseOne(data.FacultyId, 'Faculty');
  if (validate.errors.length > 0) {
    errDiv.innerHTML = validate.errors[0];
    editForm.prepend(errDiv);
    setTimeout(() => {
      errDiv.remove();
    }, 3000);
    return;
  }
  data.FacultyId = Number(data.FacultyId);
  data.DepartmentId = departments[index].DepartmentId;

  try {
    await axios.put(`http://localhost:8097/api/v1/departments`, data);
    departments[index] = data;
    renderTable();
    $('#editModal').modal('hide');
  } catch (error) {
  }
}

const search = async (e) => {
  e.preventDefault();
  const formData = new FormData(searchForm);
  const data = Object.fromEntries(formData.entries());
  data.Status = Number(data.Status);

  if (data.FacultyId === "") {
    delete data.FacultyId;
  } else {
    data.FacultyId = Number(data.FacultyId);
  }

  try {
    const res = await axios.post('http://localhost:8097/api/v1/departments', data);
    renderTable(res.data);
    $('#searchModal').modal('hide');
    $('#reset-btn').show();
    // remove class d-none from reset button
    $('#reset-btn').removeClass('d-none');
    for (const element in e.target.elements) {
      if (e.target.elements[element].value) {
        e.target.elements[element].value = '';
      }
    }

  } catch (error) {
  }
}

const reset = () => {
  renderTable();
  $('#reset-btn').hide();
}