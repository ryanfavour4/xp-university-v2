let courses = [];
let departments = [];
const UNITS = [1, 2, 3, 4, 5]
const LEVELS = ["100 level", "200 level", "300 level", "400 level", "500 level", "600 level", "700 level"];
const SEMESTERS = ["1st semester", "2nd semester"]


const renderTable = (data) => {
  let coursesDT = data ? data : courses;

  const tableBody = document.getElementById('table-body');
  tableBody.innerHTML = '';
  coursesDT.forEach((course, id) => {
    const Department = departments.find(department => department.DepartmentId === course.DepartmentId);
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${id + 1}</td>
        <td>${course.Name}</td>
        <td>${Department.Name}</td>
        <td>${course.UniqueId}</td>
        <td>${course.Code}</td>
        <td>${course.Status == 1 ? '<div class="text-success">Active</div>' : '<div class="text-danger">Inactive<div>'}</td>
        <td>
          <button
            data-toggle="modal"
            data-target="#detailsModal" 
            class="btn btn-primary"
            onclick="populateDetails(${id})"
          >Details</button>
          <button
            data-toggle="modal"
            data-target="#editModal" 
            class="btn btn-primary"
            onclick="populateEditDepartmentPopup(${id})"
          >Edit</button>
          <button class="btn btn-danger" onclick="deleteCourse(${id})">Delete</button>
        </td>
      `;
    tableBody.appendChild(row);
  });
};


/**
 * Populates the table with courses
 * gotten from the server
 */
const populate = async () => {
  try {
    const response = await axios.get('http://localhost:8097/api/v1/courses');
    const data = response.data;
    courses = [...data];
    const response2 = await axios.get('http://localhost:8097/api/v1/departments');
    const data2 = response2.data;
    departments = [...data2];
  } catch (error) {
    courses = [];
    departments = [];
  } finally {
    renderTable();
    fillInDropdowns();
  }
}

const fillInDropdowns = async () => {
  let departmentSelects = document.querySelectorAll('.departmentSelect');
  const unitSelect = document.querySelector('.unitSelect');
  const levelSelect = document.querySelector('.levelSelect');
  const semesterSelect = document.querySelector('.semesterSelect');
  let selectHtml = '';
  departmentSelects.forEach(departmentSelect => {
    departments.forEach(department => {
      selectHtml += `<option value="${department.DepartmentId}">${department.Name}</option>`;
    });
    departmentSelect.innerHTML += selectHtml;
    selectHtml = '';
  });

  let uSelectHtml = '';
  let lSelectHtml = '';
  let sSelectHtml = '';
  UNITS.forEach((unit, index) => {
    uSelectHtml += `<option value="${index + 1}">${unit}</option>`;
  });
  LEVELS.forEach((level, index) => {
    lSelectHtml += `<option value="${index + 1}">${level}</option>`;
  });
  SEMESTERS.forEach((semester, index) => {
    sSelectHtml += `<option value="${index + 1}">${semester}</option>`;
  });

  unitSelect.innerHTML += uSelectHtml;
  levelSelect.innerHTML += lSelectHtml;
  semesterSelect.innerHTML += sSelectHtml;
}


// Populates page when DOM is loaded
document.addEventListener('DOMContentLoaded', populate);




const addCourse = async (e) => {
  e.preventDefault();
  const addCourseForm = document.getElementById('addCourseForm');
  const formData = new FormData(addCourseForm);
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
  validate.length(data.Name, 3, 50, 'Name');
  validate.length(data.Code, 2, 10, 'Code');
  validate.length(data.UniqueId, 3, 10, 'UniqueId');
  validate.choseOne(data.Units, 'Units');
  validate.choseOne(data.CourseLevel, 'Course Level');
  validate.choseOne(data.CourseSemester, 'Course Semester');
  if (validate.errors.length > 0) {
    errDiv.innerHTML = validate.errors[0];
    addCourseForm.prepend(errDiv);
    $('#addModal').scrollTop(0);
    setTimeout(() => {
      errDiv.remove();
    }, 3000);
    return;
  }

  data.DepartmentId = Number(data.DepartmentId);
  data.Units = Number(data.Units);
  data.CourseLevel = Number(data.CourseLevel);
  data.CourseSemester = Number(data.CourseSemester);

  console.log(data);
  try {
    await axios.post('http://localhost:8097/api/v1/courses/add', data)
    addCourseForm.reset();
    window.location.reload();
  } catch (error) {
    errDiv.innerHTML = error.response.data.Error;
    addCourseForm.prepend(errDiv);
  }
}

const populateEditDepartmentPopup = (index) => {
  const editForm = document.getElementById('editForm');
  const course = { ...courses[index] };

  let facultyOptions = ''
  departments.forEach(department => {
    facultyOptions += `<option value="${department.DepartmentId}" ${department.DepartmentId === course.DepartmentId ? "selected" : ""}>${department.Name}</option>`
  })
  let levelOptions = ''
  LEVELS.forEach((level, index) => {
    levelOptions += `<option value="${index + 1}" ${index + 1 === course.CourseLevel ? "selected" : ""}>${level}</option>`
  })
  let semesterOptions = ''
  SEMESTERS.forEach((semester, index) => {
    semesterOptions += `<option value="${index + 1}" ${index + 1 === course.CourseSemester ? "selected" : ""}>${semester}</option>`
  })
  let unitOptions = ''
  UNITS.forEach((unit, index) => {
    unitOptions += `<option value="${index + 1}" ${index + 1 === course.Units ? "selected" : ""}>${unit}</option>`
  })

  editForm.innerHTML = `
    <div class="form-group">
      <label for="facultyName">Department Name</label>
      <select class="form-control" name="DepartmentId" id="facultyName">
        <option value="">Select Department</option>
        ${facultyOptions}
      </select>
    </div>
    <div class="form-group">
      <label for="departmentName">Course Name</label>
      <input type="text" class="form-control" name="Name" id="departmentName" placeholder="e.g. History " value="${course.Name.trim()}">
    </div>
    <div class="form-group">
      <label for="code">Code</label>
      <input type="text" class="form-control" name="Code" id="code" placeholder=" e.g. 04" value="${course.Code.trim()}">
    </div>
    <div class="form-group">
      <label for="uniqueId">Unique ID</label>
      <input type="text" class="form-control" name="UniqueId" id="uniqueId" placeholder="e.g g8yu8" value="${course.UniqueId.trim()}">
    </div>
    <div class="form-group">
      <label for="Units">Course Units</label>
      <select class="form-control unitSelect" name="Units" id="Units">
        <option value="">Select Units</option>
        ${unitOptions}
      </select>
    </div>
    <div class="form-group">
      <label for="courseLevel">Course Level</label>
      <select class="form-control levelSelect" name="CourseLevel" id="courseLevel">
        <option value="">Select Level</option>
        ${levelOptions}
      </select>
    </div>
    <div class="form-group">
      <label for="CourseSemester">Course Semester</label>
      <select class="form-control semesterSelect" name="CourseSemester" id="CourseSemester">
        <option value="">Select Semester</option>
        ${semesterOptions}
      </select>
    </div>
    <div class="form-group">
      <div class="form-check">
        <input 
          class="form-check-input" 
          name="Status" 
          type="checkbox" 
          id="status"
          ${course.Status == 1 ? 'checked' : ''}
        >
        <label class="form-check-label" for="status">
          Is active
        </label>
      </div>
    </div>
    <button 
      type="button"
      class="btn btn-primary float-right"
      onclick="updateCourse(${index})"
    >Update</button>`
}

const deleteCourse = (index) => {
  const container = document.getElementById('container-table-wrap');
  const course = courses[index];
  try {
    axios.delete(`http://localhost:8097/api/v1/courses/${course.CourseId}`)
    const newDiv = document.createElement('div');
    newDiv.className = 'alert alert-success';
    newDiv.innerHTML = 'Course deleted successfully';
    container.prepend(newDiv);
    courses.splice(index, 1);
    renderTable();
    setTimeout(() => {
      newDiv.remove();
    }, 5000);
    // window.location.reload();
  } catch (error) {
  }
}

const updateCourse = async (index) => {
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
  validate.length(data.Name, 3, 50, 'Name');
  validate.length(data.Code, 2, 10, 'Code');
  validate.length(data.UniqueId, 3, 10, 'UniqueId');
  validate.choseOne(data.Units, 'Units');
  validate.choseOne(data.CourseLevel, 'Course Level');
  validate.choseOne(data.CourseSemester, 'Course Semester');
  if (validate.errors.length > 0) {
    errDiv.innerHTML = validate.errors[0];
    editForm.prepend(errDiv);
    $('#addModal').scrollTop(0);
    setTimeout(() => {
      errDiv.remove();
    }, 3000);
    return;
  }

  data.DepartmentId = Number(data.DepartmentId);
  data.Units = Number(data.Units);
  data.CourseLevel = Number(data.CourseLevel);
  data.CourseSemester = Number(data.CourseSemester);
  data.CourseId = courses[index].CourseId;

  try {
    await axios.put(`http://localhost:8097/api/v1/courses`, data);
    courses[index] = data;
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
    const res = await axios.post('http://localhost:8097/api/v1/courses', data);
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

const populateDetails = (index) => {
  const course = { ...courses[index] };
  const department = departments.find(department => department.DepartmentId === course.DepartmentId);
  const detailsContainer = document.getElementById('detailsContainer');
  detailsContainer.innerHTML = `
    <div class="row container-fluid">
      <div class="col-md-12 container-fluid">
        <p><strong>Department Name:</strong> ${department.Name}</p>
        <p><strong>Course Name:</strong> ${course.Code}</p>
        <p><strong>Course Code:</strong> ${course.Code}</p>
        <p><strong>Course Unique ID:</strong> ${course.UniqueId}</p>
        <p><strong>Course Level:</strong> ${course.CourseLevel}00 level</p>
        <p><strong>Course Semester:</strong> ${course.CourseSemester === 1 ? "1st" : "2nd"} semester</p>
        <p><strong>Course Status:</strong> ${course.Status === 1 ? 'Active' : 'Inactive'}</p>
      </div>
    </div>`

}