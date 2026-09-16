describe('Login', () => {
  it('Login dengan akun yang valid', () => {
    cy.visit('/login');

    cy.get('input[name="email"], input[id="email"], input[type="email"]')
      .clear()
      .type('user@test.com');

    cy.get('input[name="password"], input[id="password"], input[type="password"]')
      .clear()
      .type('123456');

    cy.contains('button', /login|masuk/i).click();
    cy.location('pathname').should('include', '/dashboard');
  });
});