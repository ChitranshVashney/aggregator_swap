// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SwapWith1inch {
    event ZeroXCallSuccess(bool status, uint256 initialBuyTokenBalance);
    event buyTokenBought(uint256 buTokenAmount);

    /**
     * @dev Event to notify if transfer successful or failed
     * after account approval verified
     */
    event TransferSuccessful(
        address indexed from_,
        address indexed to_,
        uint256 amount_
    );

    error FillQuote_Swap_Failed(IERC20 buyToken, IERC20 sellToken);

    /**
     * @dev method that handles transfer of ERC20 tokens to other address
     * it assumes the calling address has approved this contract
     * as spender
     * @param amount numbers of token to transfer
     */
    function depositToken(IERC20 sellToken, uint256 amount) private {
        sellToken.transferFrom(msg.sender, address(this), amount);
        emit TransferSuccessful(msg.sender, address(this), amount);
    }

    // Transfer tokens held by this contrat to the sender/owner.
    function withdrawToken(IERC20 token, uint256 amount) internal {
        token.transfer(msg.sender, amount);
    }

    // Swaps ERC20->ERC20 tokens held by this contract using a 1inch-API quote.
    function fillQuote(
        IERC20 sellToken,
        // The `buyTokenAddress` field from the API response.
        IERC20 buyToken,
        // The `allowanceTarget` field from the API response.
        address spender,
        // The `to` field from the API response.
        address swapTarget,
        // The `data` field from the API response.
        bytes calldata swapCallData,
        uint256 sellAmount
    ) public returns (uint256) {
        depositToken(sellToken, sellAmount);
        sellToken.approve(spender, type(uint128).max);
        (bool success, ) = swapTarget.call{value: 0}(swapCallData);
        emit ZeroXCallSuccess(success, sellAmount);
        if (!success)
            revert FillQuote_Swap_Failed({
                buyToken: buyToken,
                sellToken: sellToken
            });
        uint256 boughtAmount = buyToken.balanceOf(address(this));
        withdrawToken(buyToken, boughtAmount);
        emit buyTokenBought(boughtAmount);
        return boughtAmount;
    }
}
