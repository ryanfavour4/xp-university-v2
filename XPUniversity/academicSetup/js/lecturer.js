let lecturers = [];
let departments = [];


const renderTable = (data) => {
  let lecturersDT = data ? data : lecturers;

  const tableBody = document.getElementById('table-body');
  tableBody.innerHTML = '';
  lecturersDT.forEach((lecturer, id) => {
    const Department = departments.find(department => department.DepartmentId === lecturer.DepartmentId);
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${id + 1}</td>
        <td>${lecturer.Surname}</td>
        <td>${lecturer.FirstName}</td>
        <td>${lecturer.OtherNames || ""}</td>
        <td>${Department.Name}</td>
        <td>${lecturer.StaffId}</td>
        <td>${lecturer.Status == 1 ? '<div class="text-success">Active</div>' : '<div class="text-danger">Inactive<div>'}</td>
        <td>
          <button
            data-toggle="modal"
            data-target="#editModal" 
            class="btn btn-primary"
            onclick="populateEditLecturerPopup(${id})"
          >Edit</button>
          <button class="btn btn-danger" onclick="deleteLecturer(${id})">Delete</button>
        </td>
      `;
    tableBody.appendChild(row);
  });
};


/**
 * Populates the table with lecturers
 * gotten from the server
 */
const populate = async () => {
  try {
    const response = await axios.get('http://localhost:8097/api/v1/lecturers');
    const data = response.data;
    lecturers = [...data];
    const response2 = await axios.get('http://localhost:8097/api/v1/departments');
    const data2 = response2.data;
    departments = [...data2];
  } catch (error) {
    lecturers = [];
    departments = [];
  } finally {
    renderTable();
    fillInDropdowns();
  }
}

const fillInDropdowns = async () => {
  let departmentSelects = document.querySelectorAll('.departmentSelect');
  let selectHtml = '';
  departmentSelects.forEach(departmentSelect => {
    departments.forEach(department => {
      selectHtml += `<option value="${department.DepartmentId}">${department.Name}</option>`;
    });
    departmentSelect.innerHTML += selectHtml;
    selectHtml = '';
  });
}


// Populates page when DOM is loaded
document.addEventListener('DOMContentLoaded', populate);




const addLecturer = async (e) => {
  e.preventDefault();
  const addLecturerForm = document.getElementById('addLecturerForm');
  const formData = new FormData(addLecturerForm);
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
  validate.choseOne(data.DepartmentId, 'Department');
  validate.length(data.Surname, 3, 50, 'Surname');
  validate.length(data.FirstName, 3, 50, 'FirstName');
  validate.length(data.StaffId, 3, 10, 'StaffId');
  if (validate.errors.length > 0) {
    errDiv.innerHTML = validate.errors[0];
    addLecturerForm.prepend(errDiv);
    $('#addModal').scrollTop(0);
    setTimeout(() => {
      errDiv.remove();
    }, 3000);
    return;
  }

  data.DepartmentId = Number(data.DepartmentId);
  try {
    await axios.post('http://localhost:8097/api/v1/lecturers/add', data)
    addLecturerForm.reset();
    window.location.reload();
  } catch (error) {
    errDiv.innerHTML = error.response.data.Error;
    addLecturerForm.prepend(errDiv);
  }
}

const populateEditLecturerPopup = (index) => {
  const editForm = document.getElementById('editForm');
  const lecturer = { ...lecturers[index] };

  let departmentOptions = ''
  departments.forEach(department => {
    departmentOptions += `<option value="${department.DepartmentId}" ${department.DepartmentId === lecturer.DepartmentId ? "selected" : ""}>${department.Name}</option>`
  })

  editForm.innerHTML = `
    <div class="form-group">
      <label for="facultyName">Department Name</label>
      <select class="form-control" name="DepartmentId" id="facultyName">
        <option value="">Select Department</option>
        ${departmentOptions}
      </select>
    </div>
    <div class="form-group">
      <label for="surNamE">Surname</label>
      <input type="text" class="form-control" name="Surname" id="surNamE"  value="${lecturer.Surname.trim()}">
    </div>
    <div class="form-group">
      <label for="fiRstName">First Name</label>
      <input type="text" class="form-control" name="FirstName" id="fiRstName"  value="${lecturer.FirstName.trim()}">
    </div>
    <div class="form-group">
      <label for="OtheRNames">Other Names</label>
      <input type="text" class="form-control" name="OtherNames" id="OtheRNames"  value="${lecturer.OtherNames ?lecturer.OtherNames.trim() : ""}">
    </div>
    <div class="form-group">
      <label for="staffId">Unique ID</label>
      <input type="text" class="form-control" name="StaffId" id="staffId" placeholder="e.g g8y" value="${lecturer.StaffId.trim()}">
    </div>
    <div class="form-group">
      <div class="form-check">
        <input 
          class="form-check-input" 
          name="Status" 
          type="checkbox" 
          id="status"
          ${lecturer.Status == 1 ? 'checked' : ''}
        >
        <label class="form-check-label" for="status">
          Is active
        </label>
      </div>
    </div>
    <button 
      type="button"
      class="btn btn-primary float-right"
      onclick="updateLecturer(${index})"
    >Update</button>`
}

const deleteLecturer = (index) => {
  const container = document.getElementById('container-table-wrap');
  const lecturer = lecturers[index];
  try {
    axios.delete(`http://localhost:8097/api/v1/lecturers/${lecturer.LecturerId}`)
    const newDiv = document.createElement('div');
    newDiv.className = 'alert alert-success';
    newDiv.innerHTML = 'Lecturer deleted successfully';
    container.prepend(newDiv);
    lecturers.splice(index, 1);
    renderTable();
    setTimeout(() => {
      newDiv.remove();
    }, 4000);
  } catch (error) {
    const newDiv = document.createElement('div');
    newDiv.className = 'alert alert-danger';
    newDiv.innerHTML = error.response.data.Error;
    container.prepend(newDiv);
    setTimeout(() => {
      newDiv.remove();
    }, 4000);
  }
}

const updateLecturer = async (index) => {
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
  validate.choseOne(data.DepartmentId, 'Department');
  validate.length(data.Surname, 3, 50, 'Surname');
  validate.length(data.FirstName, 3, 50, 'FirstName');
  validate.length(data.OtherNames, 3, 50, 'OtherNames');
  validate.length(data.StaffId, 3, 10, 'StaffId');
  if (validate.errors.length > 0) {
    errDiv.innerHTML = validate.errors[0];
    editForm.prepend(errDiv);
    $('#addModal').scrollTop(0);
    setTimeout(() => {
      errDiv.remove();
    }, 3000);
    return;
  }

  data.DepartmentId = Number(data.DepartmentId)
  data.LecturerId = lecturers[index].LecturerId;

  try {
    await axios.put(`http://localhost:8097/api/v1/lecturers`, data);
    lecturers[index] = data;
    renderTable();
    editForm.reset();
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

  if (data.DepartmentId === "") {
    delete data.DepartmentId;
  } else {
    data.DepartmentId = Number(data.DepartmentId);
  }

  try {
    const res = await axios.post('http://localhost:8097/api/v1/lecturers', data);
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