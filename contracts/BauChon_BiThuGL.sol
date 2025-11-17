// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BauChonBiThuGiaLai {
    string public name = "VoteGiaLai";
    string public symbol = "GL";
    uint8 public decimals = 0;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    struct UngVien {
        string hoTen;
        uint tongPhieu;
    }

    mapping(uint => UngVien) public dsUngVien;
    uint public tongUngVien;
    mapping(address => bool) public daBau;

    // các sự kiện xảy ra chuyển phát token cũng như là sự kiện xem đã bỏ phiếu chưa
    event Transfer(address indexed from, address indexed to, uint256 value);
    event DaBoPhieu(address indexed cuTri, uint maUngVien);

    //hàm này tạo ra token cho ng chạy code tức là ví admin sẽ tạo là 2345 token GL tương đương có 2345 phiếu bầu
    constructor() {
        totalSupply = 2345;
        balanceOf[msg.sender] = totalSupply;

        // danh sách các ứng viên có trong cuộc bầu cử bí thư gia lai
        themUngVien("Thai Dai Ngoc");
        themUngVien("Pham Anh Tuan");
        themUngVien("RAH Lan Chung");
        themUngVien("Nguyen Ngoc Luong");
    }
    function themUngVien(string memory _ten) internal {
        tongUngVien++;
        dsUngVien[tongUngVien] = UngVien(_ten, 0);
    }

    // phát token choc các cử tri để thực hiện bầu cử
    function transfer(address _to, uint _value) external returns (bool) {
        require(balanceOf[msg.sender] >= _value, "Khong du token");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    // bỏ phiếu cho các ứng viên
    function boPhieu(uint _maUngVien) external {
        require(!daBau[msg.sender], "Ban da bo phieu roi!");
        require(balanceOf[msg.sender] >= 1, "Khong co token de bo phieu!");
        require(_maUngVien > 0 && _maUngVien <= tongUngVien, "Ung vien khong ton tai!");

        // khi bầu thì mất 1 token và ghi nhận phiếu bầu đó
        balanceOf[msg.sender] -= 1;
        totalSupply -= 1;
        dsUngVien[_maUngVien].tongPhieu++;
        daBau[msg.sender] = true;
        emit DaBoPhieu(msg.sender, _maUngVien);
        emit Transfer(msg.sender, address(0), 1);
    }
    // kết quả cuối
    function xemKetQua() external view returns (string[] memory, uint[] memory) {
        string[] memory ten = new string[](tongUngVien);
        uint[] memory phieu = new uint[](tongUngVien);

        for (uint i = 0; i < tongUngVien; i++) {
            ten[i] = dsUngVien[i + 1].hoTen;
            phieu[i] = dsUngVien[i + 1].tongPhieu;
        }
        return (ten, phieu);
    }
}
