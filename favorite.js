// 1.網頁第一次開啟時，能看到全部的使用者名單，資料來自以下的 Index API
// 2.點擊任一使用者頭像，運用 Bootstrap Modal 製作互動視窗，資料來自以下的 Show API
// 3.使用 axios 來發送請求

const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";


// 從 localStorage 拿資料
const users = JSON.parse(localStorage.getItem('favoriteFriends')) || []

// render user list
const dataPanel = document.querySelector("#data-panel");
function renderUserList(users) {
  let userHtml = "";
  users.forEach((user) => {
    userHtml += `<div class="col-sm-3">
      <div class="mb-2">
        <div class="card d-flex align-items-center">
          <img src="${user.avatar}" class="card-img-top rounded-circle w-75 mt-3"  alt="user-poster">
          <div class="card-body">
            <p class="card-title">${user.name} ${user.surname}</p>
            <button type="button" class="btn btn-primary btn-show-user" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${user.id}">More</button>
            <button type="button" class="btn btn-danger btn-delete-favorite" data-id="${user.id}">X</button>
          </div>
        </div>
      </div>
    </div>`;
  });
  dataPanel.innerHTML = userHtml;
}

//render modal content
function showUserModal(id) {
  const userTitle = document.querySelector("#user-modal-title");
  const userModalInfo = document.querySelector(".user-modal-info")
  const userModalAvatar = document.querySelector(".modal-avatar")
  // axios 拿資料改內容
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data;
      userTitle.textContent = `${data.name} ${data.surname}`;
      userModalAvatar.src = data.avatar
      userModalInfo.innerHTML = `
        <p>Email: ${data.email}</p>
        <p>Gender: ${data.gender}</p>
        <p>Age: ${data.age}</p>
        <p>Region: ${data.region}</p>
        <p>Birthday: ${data.birthday}</p>
      `
    })
    .catch((err) => console.log(err));
}


//刪除好友資料函式

function removeFromFavorite(id) {
  // 使用
  const friendIndex = users.findIndex(user => user.id === id)
  //刪除點擊資料
  users.splice(friendIndex, 1)
  
  // setItem 把刪除完的陣列放回去
  localStorage.setItem('favoriteFriends', JSON.stringify(users))
  renderUserList(users)
}


//事件委派 more 按鈕，連接 id，放進函式改變modal內容
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-user")) {
    showUserModal(Number(event.target.dataset.id));
  } else if (event.target.matches('.btn-delete-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
});


renderUserList(users)