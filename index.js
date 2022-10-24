// 1.網頁第一次開啟時，能看到全部的使用者名單，資料來自以下的 Index API
// 2.點擊任一使用者頭像，運用 Bootstrap Modal 製作互動視窗，資料來自以下的 Show API
// 3.使用 axios 來發送請求

const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";


// 放 user data 的空陣列
const users = [];
//放過濾清單空陣列
let filterUsers = []
// 每頁需要顯示的資料數量
const USER_PER_PAGE = 8
// 分頁元素節點
const paginator = document.getElementById('paginator')

// render user list
const dataPanel = document.querySelector("#data-panel");
function renderUserList(users) {
  let userHtml = "";
  users.forEach((user) => {
    userHtml += `<div class="col-sm-3">
      <div class="mb-2">
        <div class="card d-flex align-items-center">
          <img src="${user.avatar}" class="card-img-top rounded-circle w-75 mt-3" alt="user-poster">
          <div class="card-body">
            <p class="card-title">${user.name} ${user.surname}</p>
            <button type="button" class="btn btn-primary btn-show-user" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${user.id}">More</button>
            <button type="button" class="btn btn-secondary btn-add-favorite" data-id="${user.id}">+</button>
          </div>
        </div>
      </div>
    </div>`;
  });
  dataPanel.innerHTML = userHtml;
}

// render paginator
// 參數為: 需要知道有多少個資料才知道要分多少頁
function renderPaginator(amount) {
  //ex: 100 / 12 = 8..3 (頁)
  // 小數點無條件進位
  const numberOfFriends = Math.ceil(amount / USER_PER_PAGE) 
  let rawHtml = ''
  for (let page = 1; page <= numberOfFriends; page ++) {
    rawHtml += `<li class="page-item"><a class="page-link" data-page="${page}" href="#">${page}</a></li>`
  }
  paginator.innerHTML = rawHtml
}
// 監聽 paginator 按鈕
paginator.addEventListener('click', function onPaginatorClicked(event) {
  //錯誤處理
  if (event.target.tagName !== 'A') return

  // dataset 都是字串 記得轉成 number
  const page = Number(event.target.dataset.page)
  // 隨著點擊頁數 重新渲染
  renderUserList(getUsersByPage(page))
})



// 顯示哪一頁的電影資料函式， ex: 1 --> 12，切割資料回傳新陣列
function getUsersByPage(page) {
  // users ? "users" : "filteredUsers"
  // length true > 0
  const data = filterUsers.length ? filterUsers : users
  
  // 設定起點 index
  const startIndex = (page -1) * USER_PER_PAGE
  // slice 不會拿最後一個 index 資料 ex: 0 ~ 12 = 0 ~ 11
  return data.slice(startIndex, startIndex + USER_PER_PAGE)
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

// 加入 favorite 清單函式
function addToFavorite(id) {
  // getItem 時必須轉回 js 物件陣列
  const list = JSON.parse(localStorage.getItem('favoriteFriends')) || []
  // 使用 find(回傳元素) 來比對點擊 id 和 user.id
  const friend = users.find(user => user.id === id)
  // 同樣的資料不加入 some 回傳 true/false
  if (list.some(user => user.id === id)) {
    return alert('Cannot add same friend into Favorite List')
  }
  // push 進去空陣列
  list.push(friend)
  // setItem 資料需要轉成字串才能放進去
  localStorage.setItem('favoriteFriends', JSON.stringify(list))
}


//事件委派 more 按鈕，連接 id，放進函式改變modal內容
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-user")) {
    showUserModal(Number(event.target.dataset.id));
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
});

// 處理 search bar 事件
// search bar 節點
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector('#search-input')

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  // 拿 input.value 值，並且 trim 防止空白，固定小寫
  const keyword = searchInput.value.trim().toLowerCase()
  
  // 錯誤處理
  // if(!keyword.length) {
  //   searchInput.value = ""
  //   return alert ('請輸入有效字串')
  // }
  
  //當 includes 是空字串時，所有 item 都會通過篩選，所以能顯示全部 user list
  filterUsers = users.filter(user => user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword))

  if (filterUsers.length === 0) {
    return alert('Cannot find valid user: ' + keyword)
  } 

  // 當搜尋啟動時也需要再渲染 paginator
  renderPaginator(filterUsers.length)
  // 渲染符合輸入關鍵字的 user list
  renderUserList(getUsersByPage(1))
  
})






//把 user data 放進空陣列
axios
  .get(INDEX_URL)
  .then((response) => {
    users.push(...response.data.results);
    renderPaginator(users.length)
    renderUserList(getUsersByPage(1));
  })
  .catch((err) => console.log(err));
