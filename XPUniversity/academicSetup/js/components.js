function startApplication() {

    //TODO :: LOAD THE SIDEBAR COMPONENT AND RENDER IT ON THE ID OF THAT COMPONENT
    function loadSidebar() {
        const sidebar = document.getElementById('sidebar');
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                sidebar.innerHTML = xhr.responseText;
            }
        }
        xhr.open('GET', './components/sidebar.html', true);
        xhr.send();
    }
    loadSidebar();


    // //TODO :: LOAD THE TOPBAR COMPONENT AND RENDER IT ON THE ID OF THAT COMPONENT
    function loadTopbar() {
        const topbar = document.getElementById('topbar');
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                topbar.innerHTML = xhr.responseText;
            }
        }
        xhr.open('GET', './components/topbar.html', true);
        xhr.send();
    }
    loadTopbar();
    

    //TODO :: LOAD THE FOOTER COMPONENT AND RENDER IT ON THE ID OF THAT COMPONENT
    function loadFooter() {
        const footer = document.getElementById('footer');
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                footer.innerHTML = xhr.responseText;
            }
        }
        xhr.open('GET', './components/footer.html', true);
        xhr.send();
    }
    loadFooter();












}
//? REDNDER THE POPULATE FUNCTION AFTER DOM IS READY
document.addEventListener('DOMContentLoaded', startApplication);
