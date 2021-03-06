const orderHistoryContainer = document.getElementById('order-history-container');
const messageDiv = document.getElementById('message-div');

function displayMessage() {
  const message = JSON.parse(localStorage.getItem('message'));

  if (message) {
    messageDiv.innerHTML = `<div class="msg ${message.type}">${message.text}</div>`;
    localStorage.removeItem('message');
  }
}

displayMessage();

function fetchUserOrders() {
  const userInfo = localStorage.getItem('userInfo');
  const token = JSON.parse(userInfo).token;
  let orderDisplay = '';

  fetch(`${rootUrl}/api/v1/users/${JSON.parse(userInfo).id}/orders`, {
    mode: 'cors',
    headers: new Headers({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      Authorization: `token ${token}`,
    }),
  }).then(res => res.json())
    .then((response) => {
      if (response.data && response.data.length > 0) {
        response.data.forEach((item, index) => {
          orderDisplay = `${orderDisplay}<tr>
          <td>${item.order_id}</td>
          <td>${item.name}</td>
          <td><img src="${item.image}" alt=""></td>
          <td>${item.quantity}</td>
          <td>${item.unit_price}</td>
          <td>${moment(item.created_at).format('lll')}</td>
          <td class="processing">${item.status}</td>
          <td>
            <a href="#" class="btn btn-orange btn-sm">
              <i class="fa fa-close"></i> Cancel Order</a>
          </td>
        </tr>`;
        });
      } else {
        orderDisplay = `<tr>
          <td class="center-text" colspan="8">You have not yet placed any orders!</td>
        </tr>`;
      }

      orderHistoryContainer.innerHTML = orderDisplay;
    })
    .catch(error => console.error('Error:', error));
}

fetchUserOrders();
