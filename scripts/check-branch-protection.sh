#!/bin/bash

echo "🔍 Checking branch protection rules..."
echo "Repository: $(git remote get-url origin)"

# GitHub CLI가 설치되어 있는지 확인
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "📝 Please check manually at: https://github.com/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/settings/branches"
    exit 1
fi

# 현재 리포지토리 정보 가져오기
REPO=$(gh repo view --json owner,name -q '.owner.login + "/" + .name')

echo "📊 Branch protection rules for main branch:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# main 브랜치 보호 규칙 확인
gh api repos/$REPO/branches/main/protection 2>/dev/null | jq -r '
    "🔒 Require pull request: " + (.required_pull_request_reviews != null | tostring) +
    if .required_pull_request_reviews then
        "\n   └── Required approvals: " + (.required_pull_request_reviews.required_approving_review_count | tostring) +
        "\n   └── Dismiss stale reviews: " + (.required_pull_request_reviews.dismiss_stale_reviews | tostring) +
        "\n   └── Require code owner review: " + (.required_pull_request_reviews.require_code_owner_reviews | tostring)
    else "" end +

    "\n🔍 Require status checks: " + (.required_status_checks != null | tostring) +
    if .required_status_checks then
        "\n   └── Require up-to-date branches: " + (.required_status_checks.strict | tostring) +
        "\n   └── Required checks: " + (.required_status_checks.contexts | join(", "))
    else "" end +

    "\n🚫 Restrict pushes: " + (.restrictions != null | tostring) +
    if .restrictions then
        "\n   └── Users: " + (.restrictions.users | map(.login) | join(", ")) +
        "\n   └── Teams: " + (.restrictions.teams | map(.name) | join(", "))
    else "" end +

    "\n⚡ Allow force pushes: " + (.allow_force_pushes.enabled | tostring) +
    "\n🗑️  Allow deletions: " + (.allow_deletions.enabled | tostring)
' || {
    echo "❌ Could not fetch branch protection rules"
    echo "📝 Possible reasons:"
    echo "   - Not authenticated with GitHub CLI (run: gh auth login)"
    echo "   - No branch protection rules set"
    echo "   - Insufficient permissions"
    echo ""
    echo "🌐 Check manually at:"
    echo "   https://github.com/$REPO/settings/branches"
}

echo ""
echo "💡 For auto-merge to work:"
echo "   ✅ Required approvals should be 0"
echo "   ✅ GitHub Actions should be allowed to push"
echo "   ✅ Required status checks should include your validation workflow"
echo ""
echo "🔧 Configuration URL:"
echo "   https://github.com/$REPO/settings/branches"