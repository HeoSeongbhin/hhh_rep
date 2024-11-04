// myaccount.js

window.onload = function () {
    checkLoginStatus(); // 페이지 로드 시 로그인 상태 확인
}

// 로그인 상태 확인 함수
function checkLoginStatus() {
    var loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
        showLoggedInState(loggedInUser); // 로그인 상태인 경우 환영 메시지 표시
        displayUserInfo(); // 회원 정보 표시 함수 호출
    } else {
        showLoggedOutState(); // 로그아웃 상태인 경우 표시
    }
}

async function displayUserInfo() {
    const username = localStorage.getItem("loggedInUser");
    if (username) {
        try {
            const response = await fetch('/myaccount', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${username}` // 필요 시 인증 정보 추가
                }
            });
            const data = await response.json();
            if (response.ok) {
                document.getElementById("userInfo").innerHTML = `
                    <p><strong>아이디:</strong> ${data.username}</p>
                    <p><strong>이름:</strong> ${data.name}</p>
                    <p><strong>휴대폰 번호:</strong> ${data.tel}</p>
                    <p><strong>이메일:</strong> ${data.email}</p>
                    <p><strong>생일:</strong> ${data.dob}</p>
                    <p><strong>홈페이지:</strong> ${data.url}</p>
                    <p><strong>성별:</strong> ${data.gender}</p>
                `;
            }
        } catch (error) {
            console.error('회원 정보 가져오기 오류:', error);
        }
    }
}



// 페이지 로드 시 회원 정보 표시 함수 호출
window.onload = function () {
    displayUserInfo();
};
